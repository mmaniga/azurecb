
#Setting up WebSocket in AKS

## Azure AKS Setup

### Create Resource Group
 ```shell script
 az group create --name rg-cbazure --location eastus

```

### Create Container Registory
```shell script
az acr create --resource-group rg-cbazure --name acrCBAzure --sku Basic
```
      
### Login to ACR 
```shell script
az acr login --name acrCBAzure
```

### Tag the Docker Image
```shell script
docker tag  cbproject_nide-app acrcbazure.azurecr.io/cbproject_nide-app:v3
```

### Push the Image to ACR
```shell script
docker push acrcbazure.azurecr.io/cbproject_nide-app:v3
```


### Create Service Principle in Azure
```shell script
az ad sp create-for-rbac --skip-assignment
``` 

#### Note the values it return for furure use, example like this
 ```shell script
{
    "appId": "41500071-4521-48c3-b507-635f7613bede",
    "displayName": "azure-cli-2019-10-06-17-33-43",
    "name": "http://azure-cli-2019-10-06-17-33-43",
    "password": "7df5c7ea-c088-44a3-ba7d-6d71eeda5346",
    "tenant": "b39138ca-3cee-4b4a-a4d6-cd83d9dd62f0"
  }
```


### Get the scope 
```shell script
az acr show --resource-group rg-cbazure --name acrCBAzure --query "id" --output tsv
```

#### This would return a value like this, keep a note of the value
```shell script
/subscriptions/f79d7343-26a2-4693-9d6c-6f7938de3518/resourceGroups/rg-cbazure/providers/Microsoft.ContainerRegistry/registries/acrCBAzure

```

### Make AKS access ACR by doing role assignment
1. For assignee use the appID value from the sp create function
2. For scope use the value from acr show
```shell script
az role assignment create --assignee 41500071-4521-48c3-b507-635f7613bede  --scope /subscriptions/f79d7343-26a2-4693-9d6c-6f7938de3518/resourceGroups/rg-cbazure/providers/Microsoft.ContainerRegistry/registries/acrCBAzure --role acrpull

```

### Create the AKS Cluster
```shell script
az aks create --resource-group rg-cbazure --name cb-akscluster --node-count 2 --service-principal 41500071-4521-48c3-b507-635f7613bede --client-secret 7df5c7ea-c088-44a3-ba7d-6d71eeda5346 --generate-ssh-keys

```


### Connect the Shell with the AKS Cluster
```shell script
az aks get-credentials --resource-group rg-cbazure --name cb-akscluster

```


### Show the ACR endpoint info
```shell script
 az acr list  --resource-group rg-cbazure --query "[].{acrLoginServer:loginServer}" --output table
```

### To install Nginx Ingress we need Helm, so install Helm and call Init
``` shell script 
helm init
```


### Install Nginx Ingress using Helm
```shell script 
helm install stable/nginx-ingress     --namespace ingress-basic     --set controller.replicaCount=2     --set controller.nodeSelector."beta\.kubernetes\.io/os"=linux     --set defaultBackend.nodeSelector."beta\.kubernetes\.io/os"=linux
```


### Check the Ingress 
``` shell script
kubectl get service -l app=nginx-ingress --namespace ingress-basic

```

#### Copy the IP of the command
```shell script
yodeling-elephant-nginx-ingress-controller        LoadBalancer   10.0.2.191     52.168.70.236   80:31171/TCP,443:30733/TCP   2m2s
yodeling-elephant-nginx-ingress-default-backend   ClusterIP      10.0.117.187   <none>          80/TCP                       2m2s

```


### To have a DNS record for your services, use this script to create DNS and map your Ingress IP to it

1. Create a file called createDns.sh 
2. chmod 777 createDns.sh on the shell
3. Copy the following lines into the file

```shell script

#!/bin/bash

# Public IP address of your ingress controller
IP="52.168.70.236"

# Name to associate with public IP address
DNSNAME="demo-akscb-ingress"

# Get the resource-id of the public ip
PUBLICIPID=$(az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, '$IP')].[id]" --output tsv)

# Update public ip address with DNS name
az network public-ip update --ids $PUBLICIPID --dns-name $DNSNAME

```

### To Change namespace in shell
```shell script
 kubectl config set-context --current --namespace=ingress-basic

```
### To update and existing Image in ACR
```shell script
kubectl set image deployment cbprojectnode-app cbproject-app=acrcbazure.azurecr.io/cbproject_nide-app:v4

```
### To see pods
```shell script
kubectl get pods
```

### Autoscale Pods

####In the yaml file of the resource add this to the deployment
```shell script
resources:
            requests:
              cpu: 250m
            limits:
              cpu: 500m
```
#### Enable Auto Scale
```shell script
kubectl autoscale deployment cbprojectnode-app --cpu-percent=50 --min=3 --max=10

```

#### Check status of auto scale
```shell script
kubectl get hpa

```
   
### To scale Manually

#### Cluster level
```shell script
az aks scale --resource-group rg-cbazure --name acrCBAzure --node-count 3

```
#### Application level
```shell script
kubectl scale --replicas=5 deployment/cbprojectnode-app

````


### Delete Cluster
```shell script
az group delete --name rg-cbazure --yes --no-wait

```

### Get Name of the Node Pools
```shell script
az aks show --resource-group rg-cbazure --name cb-akscluster --query agentPoolProfiles

```

### Auto Scale - PODS
```shell script
#Setting it to 20% so that its easy to test, in proudction it would be 50

kubectl autoscale deployment cbprojectnode-app --cpu-percent=20 --min=3 --max=10

```

### To get namespaces
```shell script

kubectl get namespace

```

### To get port of all services in AKS
```shell script
kubectl get endpoints
NAME                                            ENDPOINTS                                                AGE
cbazuredemo-cbserver-lb                         10.244.2.5:8040                                          94m
cbazuredemo-socketserver-lb                     10.244.0.7:8030                                          94m
estranged-sloth-nginx-ingress-controller        10.244.1.4:80,10.244.2.4:80,10.244.1.4:443 + 1 more...   166m
estranged-sloth-nginx-ingress-default-backend   10.244.1.3:8080                                          166m
redis-server                                    10.244.1.5:6379      
```

### To get all services
```shell script
kubectl get services
NAME                                            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                      AGE
cbazuredemo-cbserver-lb                         ClusterIP      10.0.155.48    <none>          8040/TCP                     96m
cbazuredemo-socketserver-lb                     ClusterIP      10.0.184.230   <none>          8030/TCP                     96m
estranged-sloth-nginx-ingress-controller        LoadBalancer   10.0.33.241    52.188.46.118   80:30424/TCP,443:31673/TCP   169m
estranged-sloth-nginx-ingress-default-backend   ClusterIP      10.0.246.234   <none>          80/TCP                       169m
redis-server                                    ClusterIP      10.0.5.233     <none>          6379/TCP                     98m

```

### To Get all context
```shell script
kubectl config get-contexts
```

### To Change context
```shell script
kubectl config use-context cb-akscluster
```

### To delete deployment
```shell script
kubectl delete -f azurecb-ingress-socket.yaml
```



### List images in registry
```shell script
az acr repository list --name azcrBrokerOct15 --output table

```
## Deploy To Jenkins

### Setup Virtual Machines

```shell script
# Run the following script to create a VM and set keys for Jenkings

curl https://raw.githubusercontent.com/Azure-Samples/azure-voting-app-redis/master/jenkins-tutorial/deploy-jenkins-vm.sh > azure-jenkins.sh
sh azure-jenkins.sh

```
```text
Warning: Permanently added '52.142.221.241' (ECDSA) to the list of known hosts.
config                                                                                                                                             100%   47KB  46.7KB/s   00:00
yes: standard output: Broken pipe
Open a browser to http://52.142.221.241:8080
Enter the following to Unlock Jenkins:
cat: /var/lib/jenkins/secrets/initialAdminPassword: No such file or directory
```


## Deploy using Azure DevOps Project Approach


