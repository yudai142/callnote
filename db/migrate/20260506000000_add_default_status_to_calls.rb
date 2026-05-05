class AddDefaultStatusToCalls < ActiveRecord::Migration[8.1]
  def change
    change_column_default :calls, :status, "pending"
  end
end
