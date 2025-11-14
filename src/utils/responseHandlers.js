const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    status: 'success',
    message
  }

  if (data !== null) {
    response.data = data
  }

  return res.status(statusCode).json(response)
}

const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  })
}

const serverErrorResponse = (res, message = 'Internal Server Error') => {
  return res.status(500).json({
    status: 'error',
    message
  })
}

module.exports = {
  successResponse,
  errorResponse,
  serverErrorResponse
}
