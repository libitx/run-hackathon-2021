defmodule ShftyWeb.WalletLive do
  use ShftyWeb, :live_view
  alias Shfty.Users
  alias Shfty.Users.User
  alias BSV.Extended

  @impl true
  def mount(_params, session, socket) do
    socket = assign(socket, [
      page_title: "Wallet",
      current_user: session["current_user"]
    ])
    {:ok, socket}
  end

  @impl true
  def handle_params(%{"location" => location}, _uri, socket) do
    {:noreply, assign(socket, :location, location)}
  end

  def handle_params(_params, _uri, socket),
    do: {:noreply, socket}

  @impl true
  def handle_event("user.search", username, socket) do
    with %User{} = user <- Users.get_user_by_username(username),
         %Extended.PublicKey{} = master <- Extended.PublicKey.from_string(user.xpub),
         %Extended.PublicKey{key: identity} <- Extended.Children.derive(master, "M/0"),
         %Extended.PublicKey{key: owner} <- Extended.Children.derive(master, "M/0/0")
    do
      pubkey = identity
      |> BSV.Crypto.ECDSA.PublicKey.compress()
      |> Base.encode16(case: :lower)

      address = owner
      |> BSV.Crypto.ECDSA.PublicKey.compress()
      |> BSV.Address.from_public_key()
      |> BSV.Address.to_string()

      user = %{
        username: user.username,
        pubkey: pubkey,
        address: address
      }
      {:reply, user, socket}
    else
      _ ->
        {:noreply, socket}
    end
  end

end
