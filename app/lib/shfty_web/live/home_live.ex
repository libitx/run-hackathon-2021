defmodule ShftyWeb.HomeLive do
  use ShftyWeb, :live_view

  @impl true
  def mount(_params, %{"current_user" => user}, socket) when not is_nil(user) do
    {:ok, push_redirect(socket, to: "/wallet")}
  end

  def mount(_params, _session, socket) do
    {:ok, socket}
  end
end
