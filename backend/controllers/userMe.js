const asyncMiddleware = require('../middleware/asyncHandler')

const userMeFactory = elite2Api => {
  const userMe = asyncMiddleware(async (req, res) => {
    const data = await elite2Api.currentUser(req.session)
    res.json(data)
  })

  return {
    userMe,
  }
}

module.exports = {
  userMeFactory,
}
