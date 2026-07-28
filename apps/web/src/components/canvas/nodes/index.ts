import TopologyNode from './TopologyNode';
import ErdNode from './ErdNode';
import UmlNode from './UmlNode';
import FlowNode from './FlowNode';

export const nodeTypes = {
  topology: TopologyNode,
  erd: ErdNode,
  uml: UmlNode,
  flow: FlowNode,
};

export { TopologyNode, ErdNode, UmlNode, FlowNode };
