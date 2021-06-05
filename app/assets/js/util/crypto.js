export const sha256 = async (data, opts = {}) => {
  data = Buffer.from(data, opts.from)
  data = await crypto.subtle.digest('SHA-256', data)
  data = Buffer.from(data)
  return opts.to ? data.toString(opts.to) : data
}

export const pbkdf2 = async (data, salt, opts = {}) => {
  const iterations = opts.iterations || 128000
  data = Buffer.from(data)
  salt = Buffer.from(salt)
  const key = await crypto.subtle.importKey(
    'raw', data, 'PBKDF2', false, ['deriveBits']
  )
  const res = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-512', salt, iterations }, key, 512
  )
  data = Buffer.from(res)
  return opts.to ? data.toString(opts.to) : data
}