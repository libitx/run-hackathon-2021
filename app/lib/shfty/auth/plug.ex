defmodule Shfty.Auth.Plug do
  @moduledoc """
  TODO
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
