class CreateCalls < ActiveRecord::Migration[8.1]
  def change
    create_table :calls do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.string :status
      t.text :transcription
      t.text :summary
      t.integer :duration
      t.datetime :started_at
      t.datetime :ended_at

      t.timestamps
    end

    add_index :calls, :status
    add_index :calls, :created_at
  end
end
