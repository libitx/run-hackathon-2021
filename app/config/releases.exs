import Config

# Configure your database
config :shfty, Shfty.Repo,
  database: System.fetch_env!("DATABASE_PATH")

# Configure endpoint
config :shfty, ShftyWeb.Endpoint,
  http: [
    port: String.to_integer(System.get_env("PORT") || "4000"),
    transport_options: [socket_opts: [:inet6]]
  ],
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE")

config :shfty,
  app_host: System.fetch_env!("APP_HOST"),
  app_port: System.fetch_env!("APP_PORT")
