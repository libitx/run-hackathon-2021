defmodule Shfty.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :username, :string
      add :xpub, :string

      timestamps()
    end

    create index(:users, ["lower(username)"], name: :username_index, unique: true)
    create index(:users, [:xpub])
  end
end
