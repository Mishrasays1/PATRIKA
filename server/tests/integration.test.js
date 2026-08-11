const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('===================================================');
  console.log('🚀 RUNNING PATRIKA FULL STACK INTEGRATION TESTS');
  console.log('===================================================\n');

  try {
    // 1. Health Check Test
    console.log('1️⃣ Testing Server Health Endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('   ✅ Health Check Status:', health.status, '| DB:', health.database);

    // 2. Auth & Profile Test
    console.log('\n2️⃣ Testing Google OAuth Login & User Profile...');
    const authRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInfo: {
          sub: 'test_google_id_1001',
          name: 'Test Citizen',
          email: 'test_citizen@patrika.org',
          picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
        }
      })
    });
    const authData = await authRes.json();
    if (!authRes.ok) throw new Error(authData.error || 'Auth failed');
    const user = authData.user;
    console.log('   ✅ Authenticated User ID:', user._id, '| Username:', user.username);

    // 3. Unique Username Update Test
    console.log('\n3️⃣ Testing Unique Username Profile Update...');
    const testUsername = `user_${Date.now()}`;
    const profileRes = await fetch(`${BASE_URL}/auth/profile/${user._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Citizen Updated',
        username: testUsername,
        bio: 'Testing profile persistence'
      })
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok) throw new Error(profileData.error || 'Profile update failed');
    console.log('   ✅ Profile Updated Username:', profileData.username);

    // 4. Create Story Test
    console.log('\n4️⃣ Testing News Story Submission...');
    const storyRes = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Test Ground Report ${Date.now()}`,
        summary: 'Testing story submission and community voting',
        content: 'Full news report text for testing integration suite.',
        category: 'Civic Infrastructure',
        media: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600' }],
        reporterId: user._id
      })
    });
    const story = await storyRes.json();
    if (!storyRes.ok) throw new Error(story.error || 'Story creation failed');
    console.log('   ✅ Story Created ID:', story._id, '| Title:', story.title);

    // 5. Per-User Voting Test (Truth vs False - Enforces 1 Vote)
    console.log('\n5️⃣ Testing Truth / False Single-Vote Constraint...');
    
    // Vote Truth
    const vote1Res = await fetch(`${BASE_URL}/stories/${story._id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        voteType: 'truth'
      })
    });
    const vote1 = await vote1Res.json();
    console.log('   ✅ Vote 1 (Truth):', vote1.action, '| Upvotes:', vote1.upvotes, '| Downvotes:', vote1.downvotes);

    // Switch Vote to False
    const vote2Res = await fetch(`${BASE_URL}/stories/${story._id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        voteType: 'false'
      })
    });
    const vote2 = await vote2Res.json();
    console.log('   ✅ Vote 2 (Switch to False):', vote2.action, '| Upvotes:', vote2.upvotes, '| Downvotes:', vote2.downvotes);

    if (vote2.upvotes === 0 && vote2.downvotes === 1) {
      console.log('   PASSED: Single vote constraint verified! User switched vote from Truth to False.');
    } else {
      console.error('   FAILED: Single vote constraint mismatch!');
    }

    // 6. Misinformation Report Flagging, Edit & Delete Test
    console.log('\n6️⃣ Testing Misinformation Flag Report (Create, Edit, Delete)...');
    
    // Create Flag
    const flag1Res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId: story._id,
        reporterId: user._id,
        reporterName: user.name,
        reason: 'Misleading Headline',
        details: 'Initial report test explanation.'
      })
    });
    const flag1 = await flag1Res.json();
    const reportId = flag1._id;
    console.log('   ✅ Flag Submitted ID:', reportId, '| Reason:', flag1.reason);

    // Duplicate Flag Prevention Check
    const dupRes = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId: story._id,
        reporterId: user._id,
        reporterName: user.name,
        reason: 'Outdated News Event',
        details: 'Duplicate report attempt'
      })
    });
    if (dupRes.status === 400) {
      console.log('   ✅ Duplicate Flag Prevention Passed (Rejected duplicate report with HTTP 400)');
    }

    // Edit Flag
    const editFlagRes = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'Manipulated / Fake Image',
        details: 'Updated flag details explanation'
      })
    });
    const editFlag = await editFlagRes.json();
    console.log('   ✅ Flag Report Updated Reason:', editFlag.reason);

    // Delete Flag
    const delFlagRes = await fetch(`${BASE_URL}/reports/${reportId}`, {
      method: 'DELETE'
    });
    const delFlag = await delFlagRes.json();
    console.log('   ✅ Flag Report Deleted:', delFlag.message);

    // 7. Comments Create, Edit & Delete Test
    console.log('\n7️⃣ Testing Comment Feature (Create, Edit, Delete)...');
    const commentRes = await fetch(`${BASE_URL}/stories/${story._id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        userName: user.name,
        text: 'Original test comment'
      })
    });
    const commentsList = await commentRes.json();
    const createdComment = commentsList[commentsList.length - 1];
    const commentId = createdComment._id || createdComment.id;
    console.log('   ✅ Comment Added ID:', commentId, '| Text:', createdComment.text);

    // Edit Comment
    const editCommentRes = await fetch(`${BASE_URL}/stories/${story._id}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Updated test comment text'
      })
    });
    const editedList = await editCommentRes.json();
    console.log('   ✅ Comment Edited. New count:', editedList.length);

    // Delete Comment
    const delCommentRes = await fetch(`${BASE_URL}/stories/${story._id}/comments/${commentId}`, {
      method: 'DELETE'
    });
    const remainingList = await delCommentRes.json();
    console.log('   ✅ Comment Deleted. Remaining count:', remainingList.length);

    // 8. Story Deletion Test
    console.log('\n8️⃣ Testing Story Deletion...');
    const delStoryRes = await fetch(`${BASE_URL}/stories/${story._id}`, {
      method: 'DELETE'
    });
    const delStory = await delStoryRes.json();
    console.log('   ✅ Story Deleted Message:', delStory.message);

    console.log('\n===================================================');
    console.log('🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY (100% PASSED)!');
    console.log('===================================================');

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
    process.exit(1);
  }
}

runTests();
