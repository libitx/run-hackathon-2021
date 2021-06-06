defmodule Shfty.Users do
  @moduledoc """
  The Users context.
  """
  import Ecto.Query, warn: false
  alias Shfty.Repo
  alias Shfty.Users.User

  @doc """
  TODO
  """
  def get_user(id),
    do: Repo.get(User, id)

  @doc """
  TODO
  """
  def get_user_by_username(username) do
    username = String.downcase(username)
    User
    |> where([u], fragment("lower(?)", u.username) == ^username)
    |> Repo.one
  end

  @doc """
  TODO
  """
  def get_user_by(clauses) do
    clauses = Enum.map clauses, fn
      {key, value} when is_binary(key) ->
        {String.to_existing_atom(key), value}
      el ->
        el
    end
    Repo.get_by(User, clauses)
  end

  @doc """
  TODO
  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  TODO
  """
  def find_or_create_user(attrs \\ %{}) do
    case get_user_by(attrs) do
      %User{} = user ->
        {:ok, user}
      nil ->
        create_user(attrs)
    end
  end




end
