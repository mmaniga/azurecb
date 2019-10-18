#!/bin/bash
four=4
echo "Arguments count :$#"
if [ "$#" -lt  "$four" ] ; then 
  echo "./buildAndUploadImages.sh v5 cbazuredemo_socket-server cbazuredemo_cbserver azcrbrokeroct15.azurecr.io";
  exit 1;
fi
echo "Setting version : $1"
echo "Image 1 :$2"
echo "Image 2 :$3"
echo "AKS Registry :$4"

az acr login --name azcrBrokerOct15
docker-compose down
docker-compose build
docker tag $2 $4/$2:$1
docker tag $3 $4/$3:$1
docker push $4/$2:$1
docker push $4/$3:$1

