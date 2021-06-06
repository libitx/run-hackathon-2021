defmodule ShftyWeb.WalletLive do
  use ShftyWeb, :live_view
  alias Shfty.Users
  alias Shfty.Users.User
  alias BSV.Extended

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :page_title, "Wallet")}
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
         %Extended.PublicKey{key: pubkey} <- Extended.Children.derive(master, "M/0/0"),
         pubkey <- BSV.Crypto.ECDSA.PublicKey.compress(pubkey),
         %BSV.Address{} = address <- BSV.Address.from_public_key(pubkey),
         address <- BSV.Address.to_string(address)
    do
      user = %{
        username: user.username,
        pubkey: Base.encode16(pubkey, case: :lower),
        address: address
      }
      {:reply, user, socket}
    else
      _ ->
        {:noreply, socket}
    end
  end

end



#with %PublicKey{} = master <- BSV.Extended.PublicKey.from_string(xpub),
#         %PublicKey{key: pubkey} <- BSV.Extended.Children.derive(master, "M/0")
#    do
#      verify_message(conn, message) and verify_signature(sig, message, pubkey)
#    end
