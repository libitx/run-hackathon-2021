defmodule Shfty.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :username, :string
      add :xpub, :string

      timestamps()
    end

    create unique_index(:users, [:username])
    create index(:users, [:xpub])
  end
end
