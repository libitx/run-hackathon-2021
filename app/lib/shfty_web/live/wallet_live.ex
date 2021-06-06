defmodule ShftyWeb.WalletLive do
  use ShftyWeb, :live_view

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

end
