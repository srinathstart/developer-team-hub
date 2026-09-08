CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_user_id integer REFERENCES users(id) ON DELETE SET NULL,
    target_user_id integer REFERENCES users(id) ON DELETE SET NULL,
    previous_role varchar(50) NOT NULL,
    new_role varchar(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx
ON admin_audit_logs (created_at DESC);
