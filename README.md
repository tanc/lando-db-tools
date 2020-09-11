# Lando database tools plugin

The intention of the plugin is to make working with Lando database containers and external tools a little easier. The plugin comes with three Lando 'tasks':

1. `lando dbport` - prints the external port and copies it to the clipboard
2. `lando workbench` - opens a connection using the MySQL Workbench GUI
3. `lando dbeaver` - opens a connection using the dbeaver GUI

Each of these takes an optional `-s [service]` parameter where `[service]` is the name of your database service you want to interact with. For example:

```
lando dbport -s database
```

## Installation

Until plugins are easily installed (coming soon!) in Lando you will need to clone this repository into the correct location and run `yarn`. Currently the best place to clone into is `~/.lando/plugins`. This directory may not exist yet so you will need to:

```
mkdir -p ~/.lando/plugins
```

Then you can clone:

```
git clone git@github.com:tanc/lando-db-tools.git db-tools
```

Change directory:

```
cd ~/.lando/plugins/db-tools
```

Install the needed node modules:

```
yarn
```

If you have a currently running Lando project you'll need to restart it to have this plugin picked up. I haven't tested thoroughly but its possible you'll need to `lando rebuild`.

## Commands

### 1. lando dbport

The command lando dbport prints the external connection port for your database container. It will also copy that port number to your system clipboard so you can easily paste it into the settings of your GUI tool of choice.

### 2. lando workbench

If you have the `mysql-workbench` GUI tool installed you can run `lando workbench` and have it open the GUI with a connection to your database already configured and open. The database password is copied to your clipboard ready to paste in.

### 3. lando dbeaver

If you have the `dbeaver` GUI tool installed you can run `lando dbeaver` and have it open the GUI with a connection to your database already configured and open.

This has only been tested on Arch flavoured Linux. When dbeaver is installed on Arch an sh script is added to your path in `/usr/bin/dbeaver` and that opens the actual dbeaver binary. Unfortunately this script doesn't pass on the arguments string necessary for dbeaver to open the correct connection. To remedy this you can edit `/usr/bin/dbeaver` so that it looks like this:

```bash
#!/bin/sh
# Disable GTK+ Overlay scrolling
# https://bugs.archlinux.org/task/63338
# https://bugs.eclipse.org/bugs/show_bug.cgi?id=519728
export GTK_OVERLAY_SCROLLING=0
/usr/lib/dbeaver/dbeaver "$@"
```

## Windows support

There is no Windows support but I imagine this should work fine when using the Linux subsystem (WSL2) in Windows 10.
