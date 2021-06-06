defmodule Shfty.Auth do
  @moduledoc """
  Utility module to help with authticating users.
  """
  alias BSV.Extended.PublicKey

  @encoded_token_size 24
  @double_encoded_token_size 32
  @token_key "shfty.auth"

  @doc """
  Creates a signed token from the user id.
  """
  def sign_token(conn, user) do
    Phoenix.Token.sign(conn, @token_key, user.id)
  end

  @doc """
  Verifies the token and recovers the user id.
  """
  def verify_token(conn, token) do
    Phoenix.Token.verify(conn, @token_key, token, max_age: 86400)
  end

  @doc """
  If present, gets the current user from the connection.
  """
  def get_current_user(conn) do
    user = Map.get(conn.private, :current_user)
    %{"current_user" => user}
  end

  @doc """
  Verifies the given signature against the message. Derives the identity key
  from the given xpub.
  """
  def verify_signed_message(conn, sig, message, xpub) do
    with %PublicKey{} = master <- BSV.Extended.PublicKey.from_string(xpub),
         %PublicKey{key: pubkey} <- BSV.Extended.Children.derive(master, "M/0")
    do
      verify_message(conn, message) and verify_signature(sig, message, pubkey)
    end
  end

  @doc """
  Verifies the message is a kosha CSRF token.
  """
  def verify_message(conn, message) do
    csrf_token = Plug.Conn.get_session(conn, "_csrf_token")

    with <<csrf_token::@encoded_token_size-binary>> <- csrf_token,
         <<user_token::@double_encoded_token_size-binary, mask::@encoded_token_size-binary>> <- message,
         {:ok, user_token} <- Base.url_decode64(user_token)
    do
      Plug.Crypto.masked_compare(csrf_token, user_token, mask)
    else
      _ -> false
    end
  end

  @doc """
  Verifies the given signature against the message.
  """
  def verify_signature(sig, message, pubkey) do
    BSV.Message.verify(sig, message, pubkey, encoding: :base64)
  end

end
