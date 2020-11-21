# views with no variables :)

get "/installation" do |env|
  render "views/installation.ecr", "views/layout_nik.ecr"
end

get "/supporter" do |env|
  render "views/supporter.ecr", "views/layout_nik.ecr"
end

get "/watchlist" do |env|
  render "views/watchlist.ecr", "views/layout_nik.ecr"
end

get "/jobs" do |env|
  render "views/jobs.ecr", "views/layout_nik.ecr"
end

get "/blow_up" do |env|
  render "views/blow_up.ecr"
end

get "/search" do |env|
  render "views/search.ecr", "views/layout_nik.ecr"
end

get "/privacy" do |env|
  render "views/privacy.ecr", "views/layout_nik.ecr"
end

get "/faq" do |env|
  render "views/faq.ecr", "views/layout_nik.ecr"
end

get "/questions" do |env|
  render "views/questions.ecr", "views/layout_nik.ecr"
end

get "/add_movie" do |env|
  render "views/add_movie.ecr", "views/layout_nik.ecr"
end

get "/support" do |env| # contact
  render "views/support.ecr", "views/layout_nik.ecr"
end

get "/instructions_create_new_url" do | env|
  render "views/instructions_create_new_url.ecr", "views/layout_nik.ecr"
end

get "/ping" do |env|
  "It's alive!"
end

get "/terms_of_service_youtube" do |env|
  render "views/terms_of_service_youtube.ecr", "views/layout_nik.ecr"
end
