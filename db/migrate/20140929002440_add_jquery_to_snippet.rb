class AddJqueryToSnippet < ActiveRecord::Migration
  def change
    add_column :snippets, :jquery, :string
  end
end
