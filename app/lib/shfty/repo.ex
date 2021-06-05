defmodule Shfty.Repo do
  use Ecto.Repo,
    otp_app: :shfty,
    adapter: Ecto.Adapters.SQLite3
end
