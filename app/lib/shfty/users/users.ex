defmodule Shfty.Users do
  @moduledoc """
  The Users context.
  """
  import Ecto.Query, warn: false
  alias Shfty.Repo
  alias Shfty.Users.User

  @doc """
  Find a user by its ID.
  """
  def get_user(id),
    do: Repo.get(User, id)

  @doc """
  Find a user by its username.
  """
  def get_user_by_username(username) do
    username = String.downcase(username)
    User
    |> where([u], fragment("lower(?)", u.username) == ^username)
    |> Repo.one
  end

  @doc """
  Find a user by its username.
  """
  def get_user_by_credentials(%{"username" => username, "xpub" => xpub}) do
    username = String.downcase(username)
    User
    |> where([u], fragment("lower(?)", u.username) == ^username)
    |> where([u], u.xpub == ^xpub)
    |> Repo.one
  end

  @doc """
  Creates a user.
  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Find or creates a user.
  """
  def find_or_create_user(attrs \\ %{}) do
    case get_user_by_credentials(attrs) do
      %User{} = user ->
        {:ok, user}
      nil ->
        create_user(attrs)
    end
  end

end
