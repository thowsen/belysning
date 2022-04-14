# Monadens Belysning
## Setup project

install npm and node\
```sudo apt install node npm```\
or \
```sudo pacman -S node npm```

then stand in project folder and \
```npm install```

Last but not least:

``` echo "GATEWAY_SECURITY_CODE" > .env ```\
where GATEWAY_SECURITY_CODE is the code written on the back of the gateway. Do not commit this file!

done, make sure you're on the same network as the gateway & you're not using a VPN

## Add new lightscenes

Scenes should be added to ```/util/routines```


<img src="./doc/megaman.png" width="150" style="margin-top:50px, ">
