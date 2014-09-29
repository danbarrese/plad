# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140929002440) do

  create_table "snippets", force: true do |t|
    t.text     "bash4"
    t.text     "winshell"
    t.text     "powershell"
    t.text     "vbs"
    t.text     "vim"
    t.text     "python3"
    t.text     "java"
    t.text     "js"
    t.text     "groovy"
    t.text     "c"
    t.text     "cpp"
    t.text     "scala"
    t.text     "erlang"
    t.text     "ruby2"
    t.text     "clojure"
    t.string   "trigger"
    t.string   "links"
    t.string   "pre"
    t.string   "category"
    t.string   "desc"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "rails4"
    t.string   "jquery"
  end

  add_index "snippets", ["trigger"], name: "index_snippets_on_trigger", unique: true

end
