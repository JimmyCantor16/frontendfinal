async login(payload) {
  const { data } = await api.post('/login', {
    email: payload.email,
    password: payload.password
  })

  localStorage.setItem('token', data.access_token)
  localStorage.setItem('user', JSON.stringify(data.user))

  this.user = data.user
  this.token = data.access_token
  this.isAuthenticated = true

  return data
}
