-- Add soft-delete support for user-owned collections.
ALTER TABLE "lists" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Query-shape indexes for discovery, profiles, reviews, ratings, and list browsing.
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE INDEX "games_deleted_at_idx" ON "games"("deleted_at");
CREATE INDEX "games_title_idx" ON "games"("title");
CREATE INDEX "games_release_date_idx" ON "games"("release_date");
CREATE INDEX "games_rating_count_idx" ON "games"("rating_count");
CREATE INDEX "games_avg_rating_idx" ON "games"("avg_rating");

CREATE INDEX "game_platforms_platform_id_idx" ON "game_platforms"("platform_id");
CREATE INDEX "game_genres_genre_id_idx" ON "game_genres"("genre_id");
CREATE INDEX "game_tags_tag_id_idx" ON "game_tags"("tag_id");

CREATE INDEX "tags_approved_idx" ON "tags"("approved");

CREATE INDEX "reviews_deleted_at_idx" ON "reviews"("deleted_at");
CREATE INDEX "reviews_game_id_status_idx" ON "reviews"("game_id", "status");
CREATE INDEX "reviews_user_id_status_idx" ON "reviews"("user_id", "status");

CREATE INDEX "ratings_game_id_idx" ON "ratings"("game_id");
CREATE INDEX "ratings_score_idx" ON "ratings"("score");

CREATE INDEX "lists_deleted_at_idx" ON "lists"("deleted_at");
CREATE INDEX "lists_user_id_visibility_idx" ON "lists"("user_id", "visibility");

CREATE INDEX "list_items_game_id_idx" ON "list_items"("game_id");
CREATE INDEX "list_items_list_id_position_idx" ON "list_items"("list_id", "position");
