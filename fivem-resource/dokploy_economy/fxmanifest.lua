fx_version 'cerulean'
game 'gta5'

author 'Dokploy AI'
description 'Sistema de Economía y Pagos Integrado (React)'
version '2.0.0'

shared_script 'config.lua'

server_scripts {
    '@mysql-async/lib/MySQL.lua',
    'server/main.lua'
}

client_scripts {
    'client/main.lua'
}

dependencies {
    'mysql-async',
    'es_extended'
}

ui_page 'ui/dist/index.html'

files {
    'ui/dist/index.html',
    'ui/dist/assets/*'
}
