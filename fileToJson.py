
from pprint import pprint
import time
import hashlib
import json
import pickle
import operator
from bson import ObjectId
from bson.son import SON

def uiCellName( cellName):
    return cellName[2:]

def position( cellName):
    x = int( uiCellName( cellName)) % 5
    y = int( uiCellName( cellName)) // 5
    return x, y

class GlobalView:
    cellPorts = {}
    cellPortLinks = {}
    fromParentPortTree = {}
    toChildPortTree = {}
    linkTrees = {}
    opHistory = []
    messageId = 0

    def addCell(self, newCell):
        if newCell in self.cellPorts:
            return

        self.cellPorts[newCell] = {}
        print("This is a message inside the class.")
        (x, y) = position( newCell)

        #newCell = 'C1'
        #x=1
        #y=1
        payload = dict( cellName = uiCellName( newCell), row=x, col = y)
        json_data = dict(op = "cellAdd", payload=payload)
#            self.opHistory.append("['op':'cellAdd', ('{}', {}, {})]".format(uiCellName( newCell), x, y))
        self.generateMessage( json_data)

    def helloLink(self, cellA, portA, cellB, portB):
        cellPortLabelA = cellA + "#" + str( portA)
        cellPortLabelB = cellB + "#" + str( portB)

        self.addCell(cellA)
        self.addCell(cellB)
        ports = self.cellPorts[cellA]
        if cellPortLabelA not in ports:
            ports[cellPortLabelA] = {}
        if cellPortLabelB not in ports:
            ports[cellPortLabelB] = {}

        cellPortA = dict(CellPort=dict(cellName=uiCellName(cellA), portNum=portA))
        cellPortB = dict(CellPort=dict(cellName=uiCellName(cellB), portNum=portB))

        payload = [cellPortA, cellPortB]
        if cellPortLabelA not in self.cellPortLinks:
            self.cellPortLinks[cellPortLabelA] = cellPortLabelB
            self.cellPortLinks[cellPortLabelB] = cellPortLabelA

            json_data = dict(op="linkAdd", payload=payload)
            #        self.opHistory.append("['linkAdd', ( '{}', {}), ('{}', {})]".format( uiCellName( cellB), portB, uiCellName( cellA), portA))
            self.generateMessage( json_data)
        else:
            json_data = dict(op="linkAdd", payload=payload, is_reversed = "Y")
            #        self.opHistory.append("['linkAdd', ( '{}', {}), ('{}', {})]".format( uiCellName( cellB), portB, uiCellName( cellA), portA))
#            self.generateMessage( json_data)

    def discover(self, cellA, portA, cellB, portB, treeId, hops):
        cellPortA = cellA + "#" + str( portA)
        cellPortB = cellB + "#" + str( portB)
        portsB = self.cellPorts[cellB]
        if cellPortB not in portsB:
            portsB[cellPortB] = {}
        if cellPortA not in portsB[cellPortB]:
            portsB[cellPortB][cellPortA] = {}
        portsB[cellPortB][cellPortA][treeId] = {"hops": hops}

    def discoverD(self, cellA, portA, cellB, portB, treeId):
        cellPortLabelA = cellA + "#" + str( portA)
        cellPortLabelB = cellB + "#" + str( portB)
        portsB = self.cellPorts[cellB]
        if cellPortLabelB not in portsB:
            portsB[cellPortLabelB] = {}
        if cellPortLabelA not in portsB[cellPortLabelB]:
            portsB[cellPortLabelB][cellPortLabelA] = {}
        portsB[cellPortLabelB][cellPortLabelA][treeId]["active"] = "Y"
#        cellB = 'C1'
#        portB = 1
#        cellA = 'C2'
#        portA = 3

        cellPortB = dict(CellPort=dict(cellName=uiCellName(cellB), portNum=portB))
        cellPortA = dict(CellPort=dict(cellName=uiCellName(cellA), portNum=portA))

        payload = dict( cellPortB, tree=dict( treeName = uiCellName( treeId)))
        json_data = dict(op="rtAdd", payload=payload)
#        self.opHistory.append("['rtAdd', ('{}', {}), {}]".format(uiCellName( cellB), portB, uiCellName( treeId)))
        self.generateMessage( json_data)

    def generateMessage(self, json_obj):
#        self.opHistory.append("['op':'cellAdd', ('{}', {}, {})]".format(uiCellName(newCell), x, y))
        json_obj['messageId'] = self.messageId
        self.messageId = self.messageId + 1
        self.opHistory.append( json_obj)
        pass


    def getLink(myCell, myPort):
        pass

    def addTree(self, myCell, myPort, treeId):
        link = self.getLink(myCell, myPort)
        if link not in self.linkTrees:
            self.linkTrees[link] = {}
        trees = self.linkTrees[link]
        trees[treeId] = treeId


gv = GlobalView()


def process_discover_msg(record, blueprint):
    my_cell_name = record['body']['cell_id']['name']
    my_cell_port_no = record['body']['port_no']
    my_cell_port_full_name = my_cell_name + '#' + str(my_cell_port_no)

    other_cell_port_full_name = blueprint[my_cell_port_full_name]
    other_cell_name = other_cell_port_full_name.split('#')[0]
    other_cell_port_no = other_cell_port_full_name.split('#')[1]

    tree_uuid = record['body']['msg']['payload']['tree_id']['uuid']['uuid']
    tree_name = record['body']['msg']['payload']['tree_id']['name']

    hops = record['body']['msg']['payload']['hops']
    #    print( "tree_name : ", tree_name, " my_cell_port_full_name : " , my_cell_port_full_name, " other_cell_port_full_name : ", other_cell_port_full_name)

    logicalLink = other_cell_port_full_name + ':' + my_cell_port_full_name

    if other_cell_port_full_name > my_cell_port_full_name:
        phisicalLink = my_cell_port_full_name + ':' + other_cell_port_full_name
    else:
        phisicalLink = other_cell_port_full_name + ':' + my_cell_port_full_name

    gv.discover( other_cell_name, other_cell_port_no, my_cell_name, my_cell_port_no, tree_name, hops)

def process_discoverd_msg(record, blueprint):
    sender_cell_name = record['body']['cell_id']['name']
    sender_cell_port_no = record['body']['port_no']
    sender_cell_port_full_name = sender_cell_name + '#' + str(sender_cell_port_no)

    receiver_cell_port_full_name = blueprint[sender_cell_port_full_name]
    receiver_cell_name = receiver_cell_port_full_name.split('#')[0]
    receiver_cell_port_no = receiver_cell_port_full_name.split('#')[1]
    tree_uuid = record['body']['msg']['payload']['tree_id']['uuid']['uuid']
    tree_name = record['body']['msg']['payload']['tree_id']['name']

    if receiver_cell_name > sender_cell_name:
        phisicalLink = sender_cell_port_full_name + ':' + receiver_cell_port_full_name
    else:
        phisicalLink = receiver_cell_port_full_name + ':' + sender_cell_port_full_name
    logicalLink = sender_cell_port_full_name + ":" + receiver_cell_port_full_name

    gv.discoverD( sender_cell_name, sender_cell_port_no, receiver_cell_name, receiver_cell_port_no, tree_name)

def process_hello_msg(record, blueprint):
    #    print( "process_hello_msg: ", record["header"]["function"])
    #    print( record)
    receiver_cell_name = record['body']['cell_id']['name']
    receiver_cell_uuid = record['body']['cell_id']['uuid']['uuid']
    receiver_cell_port_no = record['body']['recv_port_no']
    receiver_cell_port_full_name = receiver_cell_name + '#' + str(receiver_cell_port_no)
    sender_cell_name = record['body']['msg']['payload']['cell_id']['name']
    sender_cell_uuid = record['body']['msg']['payload']['cell_id']['uuid']['uuid']
    sender_cell_port_no = record['body']['msg']['payload']['port_no']
    sender_cell_port_full_name = sender_cell_name + '#' + str(sender_cell_port_no)
    #    print( "sender_cell_name :", sender_cell_name)
    #    print( "sender_cell_uuid :", sender_cell_uuid)
    cellNameMap[receiver_cell_name] = receiver_cell_uuid
    cellUuidMap[receiver_cell_uuid] = receiver_cell_name
    cellNameMap[sender_cell_name] = sender_cell_uuid
    cellUuidMap[sender_cell_uuid] = sender_cell_name
    blueprint[receiver_cell_port_full_name] = sender_cell_port_full_name
    blueprint[sender_cell_port_full_name] = receiver_cell_port_full_name

    if receiver_cell_name > sender_cell_name:
        phisicalLink = sender_cell_port_full_name + ':' + receiver_cell_port_full_name
    else:
        phisicalLink = receiver_cell_port_full_name + ':' + sender_cell_port_full_name
    logicalLinkA = receiver_cell_port_full_name + ':' + sender_cell_port_full_name
    logicalLinkB = sender_cell_port_full_name + ':' + receiver_cell_port_full_name
    print(phisicalLink, logicalLinkA, logicalLinkB)

    gv.addCell(receiver_cell_name)
    gv.addCell(sender_cell_name)
    gv.helloLink(receiver_cell_name, receiver_cell_port_no, sender_cell_name, sender_cell_port_no)

    return blueprint

blueprint = {}
cellNameMap = {}
cellUuidMap = {}


filename = 'multicell-trace.json'

with open(filename) as fp:
    # do stuff with fp
    line = fp.readline()
    cnt = 1
    while line:
#        print("Line {}: {}".format(cnt, line.strip()))
        line = fp.readline()
        cnt += 1
#        print( line)
        record = {}
        try:
            record = json.loads( line)
        except:
            print( line)
            continue

        if record["header"]["function"] == 'process_hello_msg':
            #        print( record["header"]["function"])
            blueprint = process_hello_msg(record, blueprint)
        elif record["header"]["function"] == 'process_discover_msg':
            #        print( record["header"]["function"])
            process_discover_msg(record, blueprint)
        elif record["header"]["function"] == 'process_discoverd_msg':
            #        print( record["header"]["function"])
            process_discoverd_msg(record, blueprint)


outputFilename = 'alanData.js'
outputFilename = 'gregoryDataOct012018.js'


target = open(outputFilename, 'w')
target.write("var foo = [\n")

for message in gv.opHistory:
    print( json.dumps( message), ',')
    target.write(json.dumps( message) + ",\n")

target.write("]")
target.close();
