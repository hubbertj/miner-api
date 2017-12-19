module.exports = {
    environment: process.env.environment || 'development',
    npm_package_name: process.env.npm_package_name || 'UNKNOWN',
    server: {
        ip: process.env.app_url || '127.0.0.1',
        port: process.env.PORT || 8080
    },
    secure_cookies: process.env.secure_cookies || false,
    log_level: process.env.log_level || 'local',
    log_table: 'server_log',
    database_url: process.env.DATABASE_URL || false,
    secret: process.env.secret || '71b6c615-8f93-4b20-8dd7-6e1c5110e583',
    email : process.env.email || 'smtps://support@counterdraft.com:password@smtp.gmail.com',
    migration_run: process.env.migration_run || true,
    seeder_run: process.env.seeders_run || false,
    migration_order: process.env.migration_order || 'up',
    image_dir: process.env.image_dir || 'images/',
    image_bucket_url: process.env.image_bucket_url || null,
    google_maps_key: process.env.google_maps_key || null,
    aws_access_key_id: process.env.aws_access_key_id || null,
    aws_secret_access_key: process.env.aws_secret_access_key || null
}
