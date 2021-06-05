defmodule ShftyWeb.WalletLive do
  use ShftyWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :page_title, "Wallet")}
  end

end
