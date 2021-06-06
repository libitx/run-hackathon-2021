defmodule Shfty.Auth.Plug do
  @moduledoc """
  Auth plug that attempts to load the current user from the session.

  If the `:allow_blank` option is false, the request is redirected to the
  homepage unless a current can be found.
  """
  import Plug.Conn
  alias Shfty.{Auth, Users}
  alias Shfty.Users.User

  def init(opts), do: opts

  def call(conn, opts \\ []) do
    allow_blank = Keyword.get(opts, :allow_blank, false)

    with token when not is_nil(token) <- get_session(conn, :user_token),
         {:ok, user_id} <- Auth.verify_token(conn, token),
         %User{} = user <- Users.get_user(user_id)
    do
      put_private(conn, :current_user, user)
    else
      _ ->
        if allow_blank do
          conn
        else
          conn
          |> Phoenix.Controller.put_flash(:error, "Please sign in.")
          |> Phoenix.Controller.redirect(to: "/")
        end
    end
  end
end
