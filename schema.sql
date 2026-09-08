BEGIN;

CREATE TABLE users (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username varchar(100) NOT NULL UNIQUE,
    role varchar(50) NOT NULL,
    password text NOT NULL
);

CREATE TABLE projects (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(150) NOT NULL,
    user_id integer NOT NULL REFERENCES users(id),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    status varchar(30) NOT NULL DEFAULT 'planned',
    due_date date
);

CREATE TABLE project_members (
    project_id integer NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    user_id integer NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    role varchar(20) NOT NULL DEFAULT 'viewer',
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE tasks (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title varchar(150) NOT NULL,
    status varchar(30) NOT NULL DEFAULT 'todo',
    project_id integer NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    priority varchar(20) NOT NULL DEFAULT 'medium',
    assigned_to integer
        REFERENCES users(id) ON DELETE SET NULL,
    due_date date
);

CREATE TABLE activity_logs (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id integer NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    user_id integer
        REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_audit_logs (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_user_id integer REFERENCES users(id) ON DELETE SET NULL,
    target_user_id integer REFERENCES users(id) ON DELETE SET NULL,
    previous_role varchar(50) NOT NULL,
    new_role varchar(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX admin_audit_logs_created_at_idx
ON admin_audit_logs (created_at DESC);

COMMIT;
