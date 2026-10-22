const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const interviewFixture = require('../client/src/mockData/interviewMock.json')
const userFixture = require('../client/src/mockData/userMock.json')
const bookmarkFixture = require('../client/src/mockData/bookmarkMock.json')

describe('Mock Data Fixtures Validation', () => {
  it('validates interview mock fixture structure and scoring schema', () => {
    assert.ok(interviewFixture._id, 'Interview fixture must have _id')
    assert.strictEqual(typeof interviewFixture.finalScore, 'number')
    assert.ok(Array.isArray(interviewFixture.questions))
    assert.ok(interviewFixture.questions.length > 0)

    const firstQ = interviewFixture.questions[0]
    assert.ok(firstQ.question)
    assert.ok(firstQ.userAnswer)
    assert.ok(firstQ.rubric)
    assert.strictEqual(typeof firstQ.rubric.technicalAccuracy, 'number')
    assert.strictEqual(typeof firstQ.rubric.systemArchitecture, 'number')
  })

  it('validates user mock fixture structure', () => {
    assert.ok(userFixture._id)
    assert.ok(userFixture.email.includes('@'))
    assert.strictEqual(typeof userFixture.isEmailVerified, 'boolean')
    assert.ok(userFixture.stats)
    assert.strictEqual(typeof userFixture.stats.interviewsCompleted, 'number')
  })

  it('validates bookmark mock fixture items', () => {
    assert.ok(Array.isArray(bookmarkFixture))
    assert.ok(bookmarkFixture.length > 0)
    for (const bm of bookmarkFixture) {
      assert.ok(bm._id)
      assert.ok(bm.question)
      assert.ok(bm.idealAnswer)
      assert.ok(bm.category)
    }
  })
})
