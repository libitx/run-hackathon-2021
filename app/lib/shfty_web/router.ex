defmodule ShftyWeb.Router do
  use ShftyWeb, :router
  alias Shfty.Auth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {ShftyWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :ensure_user do
    plug Shfty.Auth.Plug
  end

  pipeline :maybe_user do
    plug Shfty.Auth.Plug, allow_blank: true
  end

  scope "/", ShftyWeb do
    pipe_through [:browser, :maybe_user]

    live "/", HomeLive, :index, session: {Auth, :get_current_user, []}
  end

  scope "/", ShftyWeb do
    pipe_through [:browser, :ensure_user]

    live "/wallet", WalletLive, :index, session: {Auth, :get_current_user, []}
  end

  scope "/", ShftyWeb do
    pipe_through :api

    post "/auth", AuthController, :login
    delete "/auth", AuthController, :logout
  end

  # Other scopes may use custom stacks.
  # scope "/api", ShftyWeb do
  #   pipe_through :api
  # end
end
