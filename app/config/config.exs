# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :shfty,
  ecto_repos: [Shfty.Repo],
  generators: [binary_id: true]

# Configures the endpoint
config :shfty, ShftyWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "ZUD2y1Rz2Z0idAfUO1waC/9xz5yYFb6w495sxdZe6UrTbZIbOD2hxEwH/N1o4Cpe",
  render_errors: [view: ShftyWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Shfty.PubSub,
  live_view: [signing_salt: "XRlDpyBA"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
