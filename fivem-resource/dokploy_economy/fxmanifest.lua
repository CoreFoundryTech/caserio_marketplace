fx_version 'cerulean'
game 'gta5'

author 'Dokploy AI'
description 'Sistema de Economía y Pagos Integrado (React)'
version '2.0.0'

shared_script 'config.lua'

server_scripts {
    'server/main.lua'
}

client_scripts {
    'client/main.lua'
}

    'oxmysql',
    'qb-core'

ui_page 'ui/dist/index.html'

files {
    'ui/dist/index.html',
    'ui/dist/assets/*'
}
