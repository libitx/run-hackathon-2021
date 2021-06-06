defmodule Shfty.Release do
  def migrate do
    ensure_started()
    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def rollback(version) do
    ensure_started()
    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
    end
  end

  defp repos do
    Application.load(:shfty)
    Application.ensure_loaded(:txbox)
    Application.fetch_env!(:shfty, :ecto_repos)
  end

  defp ensure_started do
    Application.ensure_all_started(:ssl)
  end
end
