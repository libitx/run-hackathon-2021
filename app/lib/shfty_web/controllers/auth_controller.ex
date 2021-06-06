defmodule ShftyWeb.AuthController do
  use ShftyWeb, :controller
  alias Shfty.{Auth, Users}

  action_fallback :unauthorized

  @doc """
  Signs a user in and puts an auth token in the session.

  If the user already exists then fine... if they dont then we create one. One
  simple all-in-one sign-in/register action.
  """
  def login(conn, %{"message" => msg, "signature" => sig, "username" => username, "xpub" => xpub}) do
    with true <- Auth.verify_signed_message(conn, sig, msg, xpub),
         {:ok, user} <- Users.find_or_create_user(%{"username" => username, "xpub" => xpub})
    do
      conn
      |> put_session(:user_token, Auth.sign_token(conn, user))
      |> put_session(:live_socket_id, "user_socket:#{user.id}")
      |> resp(:ok, "")
    end
  end

  @doc """
  Signs the user out. Removes the token from the session and disconnects any
  live socket connections associated with that user.
  """
  def logout(conn, _params) do
    live_socket_id = get_session(conn, :live_socket_id)
    ShftyWeb.Endpoint.broadcast(live_socket_id, "disconnect", %{})

    conn
    |> delete_session(:user_token)
    |> delete_session(:live_socket_id)
    |> resp(:no_content, "")
  end

  # Unauthorised. Bugger offski!
  defp unauthorized(conn, _), do: resp(conn, :unauthorized, "")

end
