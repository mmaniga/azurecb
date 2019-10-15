# K8S Notes
## Hardware Abstraction 

### Node
Its the hardware, a VM or physical machine

### Cluster

Pool of Nodes, gives the combined computing power

### Persistent Volume

Because cluster is composed of Nodes which can move, delete, etc, local storage is not good, so a persistent 
volume is attached to the Cluster 

## Sofware Abstraction

### Container

Programs running in K8S are packaged as Linux Containers. Multiple programs can be run in a single container.

### POD

In K8S containers are wrapped into higher level abstraction called POD in which all container share resource
and local network. Container to container can communicate in the same POD.

Pods are used as unit of replication, 

POds are not launched by itself.

Each pod is allocated its own IP address. 
Containers within a pod share this IP address, port space and can find each other via localhost.

### ReplicaSet



### Deployment

POds are not launched by itself on the cluster, they are done by an abstraction called Deployment.
A deployment’s primary purpose is to declare how many replicas of a pod should be running at a time. 

When a deployment is added to the cluster, it will automatically spin up the requested number of pods, and then monitor them. 

If a pod dies, the deployment will automatically re-create it.
Using a deployment, you don’t have to deal with pods manually. 
You can just declare the desired state of the system, and it will be managed for you automatically.

### Ingress

To allow external traffic to the system

### Service

Service operates at layer-4, it provides an address to communicate with POD. 

### Config Map

To store env variable  / configurations into the POD
