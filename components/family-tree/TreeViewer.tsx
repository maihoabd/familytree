"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Search, 
  Heart, 
  ChevronUp, 
  ChevronDown,
  User,
  Calendar,
  MapPin,
  BookOpen,
  X
} from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  gender: string;
  generation: number;
  birthDate: string | Date | null;
  birthDateLunar: string | null;
  deathDate: string | Date | null;
  deathDateLunar: string | null;
  isDead: boolean;
  biography: string | null;
  photoUrl: string | null;
  placeOfBirth: string | null;
  placeOfBurial: string | null;
  branch: string | null;
  fatherId: string | null;
  motherId: string | null;
  deathAnniversary?: {
    note: string | null;
    lunarDay: number;
    lunarMonth: number;
  } | null;
  marriagesAsMember1?: Array<{ member2: { id: string; fullName: string } }>;
  marriagesAsMember2?: Array<{ member1: { id: string; fullName: string } }>;
}

interface TreeNode {
  id: string;
  member: Member;
  spouse?: Member;
  children: TreeNode[];
}

interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  children: LayoutNode[];
}

interface TreeViewerProps {
  initialMembers: Member[];
}

export default function TreeViewer({ initialMembers }: TreeViewerProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  
  // Trạng thái điều khiển canvas (Pan & Zoom)
  const [scale, setScale] = useState(0.85);
  const [translate, setTranslate] = useState({ x: 100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Kích thước của node và khoảng cách
  const cardWidth = 140;
  const cardHeight = 85;
  const coupleGap = 35; // Khoảng cách giữa vợ và chồng
  const blockWidth = cardWidth * 2 + coupleGap; // Chiều rộng của 1 khối cặp đôi
  const verticalGap = 200; // Khoảng cách giữa các thế hệ
  const horizontalGap = 320; // Khoảng cách ngang tối thiểu giữa các gia đình

  // Đồng bộ lại danh sách thành viên nếu prop thay đổi
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Tìm vợ/chồng của 1 thành viên
  const findSpouse = (memberId: string): Member | undefined => {
    const member = members.find(m => m.id === memberId);
    if (!member) return undefined;

    // Tìm trong danh sách marriages
    const spouseId1 = member.marriagesAsMember1?.[0]?.member2.id;
    const spouseId2 = member.marriagesAsMember2?.[0]?.member1.id;
    
    const spouseId = spouseId1 || spouseId2;
    if (spouseId) {
      return members.find(m => m.id === spouseId);
    }
    return undefined;
  };

  // Tập hợp các ID thành viên thuộc nhóm tập trung (Ancestors, Spouses, Descendants)
  const focusedMemberIds = React.useMemo(() => {
    if (!selectedMember) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedMember.id);

    // Thêm vợ/chồng của người được chọn
    const spouse = findSpouse(selectedMember.id);
    if (spouse) ids.add(spouse.id);

    // Hàm đệ quy lấy toàn bộ tổ tiên (cha, mẹ)
    const getAncestors = (id: string) => {
      const m = members.find(x => x.id === id);
      if (!m) return;
      if (m.fatherId) {
        ids.add(m.fatherId);
        getAncestors(m.fatherId);
      }
      if (m.motherId) {
        ids.add(m.motherId);
        getAncestors(m.motherId);
      }
    };
    getAncestors(selectedMember.id);

    // Hàm đệ quy lấy toàn bộ con cháu
    const getDescendants = (id: string) => {
      const children = members.filter(x => x.fatherId === id || x.motherId === id);
      for (const child of children) {
        ids.add(child.id);
        getDescendants(child.id);
      }
    };
    getDescendants(selectedMember.id);

    return ids;
  }, [selectedMember, members]);

  // Tự động căn giữa màn hình mượt mà vào thành viên được chọn
  useEffect(() => {
    if (!selectedMember || !containerRef.current) return;

    let targetX = 0;
    let targetY = 0;
    let found = false;

    // Quét cây để tìm tọa độ (x, y) của thành viên được chọn
    const searchNode = (node: LayoutNode) => {
      if (found) return;
      if (node.member.id === selectedMember.id || node.spouse?.id === selectedMember.id) {
        targetX = node.x;
        // Lệch x một chút nếu là người phối ngẫu (vợ/chồng) để căn chính xác vào card click
        if (node.spouse?.id === selectedMember.id) {
          targetX = node.x + cardWidth / 2 + coupleGap / 2;
        } else if (node.spouse) {
          targetX = node.x - cardWidth / 2 - coupleGap / 2;
        }
        targetY = node.y;
        found = true;
        return;
      }
      node.children.forEach(searchNode);
    };

    layoutRoots.forEach(searchNode);

    if (found) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const newScale = Math.max(0.95, scale); // Phóng to nhẹ nếu góc nhìn đang quá nhỏ
      setScale(newScale);
      setTranslate({
        x: containerWidth / 2 - targetX * newScale,
        y: containerHeight / 2 - targetY * newScale,
      });
    }
  }, [selectedMember]);


  // Trích xuất con cái của cặp đôi (hoặc cá nhân nếu không có vợ/chồng)
  const getChildren = (parentId: string, spouseId?: string): Member[] => {
    return members.filter(m => {
      // Con có cha hoặc mẹ trùng khớp
      const matchFather = m.fatherId === parentId || (spouseId && m.fatherId === spouseId);
      const matchMother = m.motherId === parentId || (spouseId && m.motherId === spouseId);
      return matchFather || matchMother;
    });
  };

  // Hàm đệ quy dựng cây phân cấp từ gốc
  const buildTree = (member: Member, processed: Set<string>): TreeNode | null => {
    if (processed.has(member.id)) return null;
    processed.add(member.id);

    const spouse = findSpouse(member.id);
    if (spouse) {
      processed.add(spouse.id);
    }

    const children = getChildren(member.id, spouse?.id);
    
    // Sắp xếp các con theo ngày sinh nếu có
    children.sort((a, b) => {
      if (a.birthDate && b.birthDate) {
        return new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
      }
      return a.fullName.localeCompare(b.fullName);
    });

    const childNodes: TreeNode[] = [];
    for (const child of children) {
      const childNode = buildTree(child, processed);
      if (childNode) childNodes.push(childNode);
    }

    return {
      id: spouse ? `${member.id}_${spouse.id}` : member.id,
      member,
      spouse,
      children: childNodes,
    };
  };

  // Tạo cây phả hệ
  const getRoots = (): TreeNode[] => {
    const processed = new Set<string>();
    const roots: TreeNode[] = [];

    // Tìm cụ tổ (generation = 1, hoặc không có cha mẹ trong db)
    const gen1 = members.filter(m => m.generation === 1);
    if (gen1.length > 0) {
      // Ưu tiên cụ tổ nam làm gốc cây chính
      const males = gen1.filter(m => m.gender === "MALE");
      const rootList = males.length > 0 ? males : gen1;
      
      for (const root of rootList) {
        const tree = buildTree(root, processed);
        if (tree) roots.push(tree);
      }
    } else {
      // Nếu không có gen 1, tìm những ai không có cha mẹ liên kết
      const candidates = members.filter(m => !m.fatherId && !m.motherId);
      for (const cand of candidates) {
        const tree = buildTree(cand, processed);
        if (tree) roots.push(tree);
      }
    }

    return roots;
  };

  // Tính toán vị trí x, y cho các node bằng DFS bottom-up
  const calculateLayout = (
    node: TreeNode,
    depth: number = 0,
    state: { currentX: number }
  ): LayoutNode => {
    const y = depth * verticalGap + 100;
    const isCollapsed = collapsedNodes.has(node.id);

    if (node.children.length === 0 || isCollapsed) {
      // Node lá hoặc bị thu gọn
      const x = state.currentX;
      state.currentX += horizontalGap;
      return {
        ...node,
        x,
        y,
        children: [],
      };
    } else {
      // Node cha
      const childNodes: LayoutNode[] = [];
      for (const child of node.children) {
        childNodes.push(calculateLayout(child, depth + 1, state));
      }

      // Vị trí x của cha bằng trung bình vị trí x của con đầu và con cuối
      const firstChildX = childNodes[0].x;
      const lastChildX = childNodes[childNodes.length - 1].x;
      const x = (firstChildX + lastChildX) / 2;

      return {
        ...node,
        x,
        y,
        children: childNodes,
      };
    }
  };

  const roots = getRoots();
  const layoutState = { currentX: 100 };
  const layoutRoots = roots.map(root => calculateLayout(root, 0, layoutState));

  // Thu gọn / Mở rộng node
  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCollapsed = new Set(collapsedNodes);
    if (newCollapsed.has(nodeId)) {
      newCollapsed.delete(nodeId);
    } else {
      newCollapsed.add(nodeId);
    }
    setCollapsedNodes(newCollapsed);
  };

  // Quản lý kéo thả Canvas (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Chỉ chuột trái
    setIsDragging(true);
    dragStart.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom bằng chuột cuộn
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    let newScale = scale - e.deltaY * zoomFactor * 0.01;
    newScale = Math.max(0.2, Math.min(2.5, newScale));
    setScale(newScale);
  };

  // Nút điều khiển Zoom
  const zoomIn = () => setScale(prev => Math.min(2.5, prev + 0.15));
  const zoomOut = () => setScale(prev => Math.max(0.2, prev - 0.15));
  const resetView = () => {
    setScale(0.85);
    setTranslate({ x: 150, y: 50 });
  };
  const fitScreen = () => {
    if (layoutRoots.length === 0) return;
    // Tính bao khung (bounding box) của cây để căn giữa
    let minX = Infinity;
    let maxX = -Infinity;
    const traverse = (node: LayoutNode) => {
      minX = Math.min(minX, node.x - blockWidth / 2);
      maxX = Math.max(maxX, node.x + blockWidth / 2);
      node.children.forEach(traverse);
    };
    layoutRoots.forEach(traverse);

    const treeWidth = maxX - minX;
    if (containerRef.current && treeWidth > 0) {
      const containerWidth = containerRef.current.clientWidth;
      const newScale = Math.min(0.9, (containerWidth / treeWidth) * 0.9);
      setScale(newScale);
      setTranslate({
        x: (containerWidth - treeWidth * newScale) / 2 - minX * newScale,
        y: 80
      });
    }
  };

  // Tìm kiếm và định vị node thành viên
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    const found = members.find(m => m.fullName.toLowerCase().includes(query));

    if (found) {
      setSelectedMember(found);
      
      // Tìm vị trí x, y của thành viên trong layoutRoots để căn giữa
      let targetX = 0;
      let targetY = 0;
      let nodeFound = false;

      const searchNode = (node: LayoutNode) => {
        if (nodeFound) return;
        if (node.member.id === found.id || node.spouse?.id === found.id) {
          targetX = node.x;
          targetY = node.y;
          nodeFound = true;
          return;
        }
        node.children.forEach(searchNode);
      };
      
      layoutRoots.forEach(searchNode);

      if (nodeFound && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        setScale(1.0); // Reset scale về 1 để dễ nhìn
        setTranslate({
          x: containerWidth / 2 - targetX,
          y: containerHeight / 2 - targetY
        });
      }
    }
  };

  // Vẽ các kết nối cây phả hệ
  const renderConnections = (node: LayoutNode): React.JSX.Element[] => {
    const lines: React.JSX.Element[] = [];
    const isCollapsed = collapsedNodes.has(node.id);

    if (node.children.length > 0 && !isCollapsed) {
      // 1. Vẽ đường dọc đi xuống từ điểm giao phối của bố mẹ
      // Điểm giao phối nằm ở giữa 2 card (nếu là couple) hoặc đáy của 1 card (nếu đơn thân)
      const parentX = node.x;
      const parentY = node.y + cardHeight / 2;
      const midY = parentY + (verticalGap - cardHeight) / 2;

      // Kiểm tra xem nút cha mẹ này có thuộc nhóm tập trung không
      const isParentFocused = 
        !selectedMember || 
        focusedMemberIds.has(node.member.id) || 
        (node.spouse !== undefined && focusedMemberIds.has(node.spouse.id));

      lines.push(
        <line
          key={`vertical-parent-${node.id}`}
          x1={parentX}
          y1={parentY + 10}
          x2={parentX}
          y2={midY}
          stroke="#8c1d1d"
          strokeWidth="2.5"
          className="transition-opacity duration-500"
          style={{ opacity: isParentFocused ? 1 : 0.15 }}
        />
      );

      // 2. Vẽ đường ngang phân nhánh nối tất cả các con
      const firstChildX = node.children[0].x;
      const lastChildX = node.children[node.children.length - 1].x;
      lines.push(
        <line
          key={`horizontal-bus-${node.id}`}
          x1={firstChildX}
          y1={midY}
          x2={lastChildX}
          y2={midY}
          stroke="#8c1d1d"
          strokeWidth="2.5"
          className="transition-opacity duration-500"
          style={{ opacity: isParentFocused ? 1 : 0.15 }}
        />
      );

      // 3. Vẽ đường dọc đi xuống từng con
      node.children.forEach(child => {
        // Kiểm tra xem nút con này có thuộc nhóm tập trung không
        const isChildFocused = 
          !selectedMember || 
          focusedMemberIds.has(child.member.id) || 
          (child.spouse !== undefined && focusedMemberIds.has(child.spouse.id));

        const lineOpacity = isParentFocused && isChildFocused ? 1 : 0.15;

        lines.push(
          <line
            key={`vertical-child-${child.id}`}
            x1={child.x}
            y1={midY}
            x2={child.x}
            y2={child.y - cardHeight / 2}
            stroke="#8c1d1d"
            strokeWidth="2.5"
            className="transition-opacity duration-500"
            style={{ opacity: lineOpacity }}
          />
        );
        lines.push(...renderConnections(child));
      });
    }

    return lines;
  };

  // Vẽ một node (Đơn thân hoặc Cặp đôi)
  const renderNode = (node: LayoutNode) => {
    const isCouple = !!node.spouse;
    const isSearchMatch = (m: Member) => {
      if (!searchQuery) return false;
      return m.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    };

    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsedNodes.has(node.id);

    return (
      <g key={node.id} className="select-none">
        {/* Nếu là cặp đôi, vẽ đường kết nối giữa hai vợ chồng */}
        {isCouple && (
          <g>
            <line
              x1={node.x - cardWidth / 2 - coupleGap / 2}
              y1={node.y}
              x2={node.x + cardWidth / 2 + coupleGap / 2}
              y2={node.y}
              stroke="#ffd700"
              strokeWidth="3"
            />
            {/* Vòng tròn tim ở giữa cầu nối */}
            <circle cx={node.x} cy={node.y} r="14" fill="#ffd700" stroke="#8c1d1d" strokeWidth="2" />
            <Heart className="h-4.5 w-4.5 text-[#8c1d1d] fill-[#8c1d1d]" style={{ transform: `translate(${node.x - 9}px, ${node.y - 9}px)` }} />
          </g>
        )}

        {/* Card Thành viên chính (Chồng / Cha hoặc Người gốc) */}
        {renderMemberCard(
          node.member, 
          isCouple ? node.x - cardWidth / 2 - coupleGap / 2 : node.x, 
          node.y, 
          isSearchMatch(node.member)
        )}

        {/* Card Vợ / Chồng đi kèm */}
        {isCouple && node.spouse && renderMemberCard(
          node.spouse, 
          node.x + cardWidth / 2 + coupleGap / 2, 
          node.y, 
          isSearchMatch(node.spouse)
        )}

        {/* Nút thu gọn / mở rộng các đời con cháu */}
        {hasChildren && (
          <g transform={`translate(${node.x}, ${node.y + cardHeight / 2})`}>
            <circle
              cx="0"
              cy="15"
              r="10"
              fill="#ffffff"
              stroke="#8c1d1d"
              strokeWidth="2"
              className="cursor-pointer hover:fill-[#ffd700] transition-colors"
              onClick={(e) => toggleCollapse(node.id, e)}
            />
            {isCollapsed ? (
              <ChevronDown 
                className="h-3.5 w-3.5 text-[#8c1d1d] pointer-events-none" 
                style={{ transform: `translate(-7px, 8px)` }}
              />
            ) : (
              <ChevronUp 
                className="h-3.5 w-3.5 text-[#8c1d1d] pointer-events-none" 
                style={{ transform: `translate(-7px, 8px)` }}
              />
            )}
          </g>
        )}
      </g>
    );
  };

  // Vẽ thẻ thành viên cụ thể
  const renderMemberCard = (member: Member, x: number, y: number, isHighlighted: boolean) => {
    const isMale = member.gender === "MALE";
    const borderClass = isHighlighted 
      ? "stroke-[#ffd700] stroke-[3.5] filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" 
      : isMale 
        ? "stroke-sky-600/80 stroke-2" 
        : "stroke-pink-500/80 stroke-2";

    const bgClass = member.isDead ? "fill-stone-100/90" : "fill-white";
    const nameColor = member.isDead ? "fill-stone-500" : "fill-stone-900";
    const isFocused = !selectedMember || focusedMemberIds.has(member.id);

    return (
      <g 
        className="cursor-pointer"
        transform={`translate(${x - cardWidth / 2}, ${y - cardHeight / 2})`}
        onClick={() => setSelectedMember(member)}
      >
        <g
          style={{
            opacity: isFocused ? 1 : 0.22,
            transform: isFocused ? "scale(1)" : "scale(0.85)",
            filter: isFocused ? "none" : "grayscale(100%) blur(0.5px)",
            transformBox: "fill-box",
            transformOrigin: "center",
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          className="hover:scale-105 transition-transform duration-300"
        >
          {/* Nền thẻ */}
          <rect
            width={cardWidth}
            height={cardHeight}
            rx="10"
            className={`${bgClass} ${borderClass} shadow-md`}
          />

          {/* Thanh tiêu đề nhỏ phân biệt chi/giới tính */}
          <path
            d={`M 2,2 L ${cardWidth - 2},2 L ${cardWidth - 2},8 L 2,8 Z`}
            fill={isMale ? "#0284c7" : "#db2777"}
          />

          {/* Tên thành viên */}
          <text
            x={cardWidth / 2}
            y="32"
            textAnchor="middle"
            className={`${nameColor} font-serif font-bold text-xs`}
          >
            {member.fullName}
          </text>

          {/* Đời thứ mấy */}
          <text
            x={cardWidth / 2}
            y="48"
            textAnchor="middle"
            className="fill-stone-400 text-[10px]"
          >
            Đời thứ {member.generation}
          </text>

          {/* Ngày sinh - mất tóm tắt */}
          <text
            x={cardWidth / 2}
            y="64"
            textAnchor="middle"
            className="fill-stone-500 text-[9px] font-mono"
          >
            {formatLifespan(member)}
          </text>

          {/* Huy hiệu ghi chú nếu đã mất */}
          {member.isDead && (
            <g transform={`translate(${cardWidth - 22}, ${cardHeight - 22})`}>
              <circle cx="8" cy="8" r="7" fill="#78716c" />
              <text x="8" y="11" textAnchor="middle" fill="#ffffff" className="text-[8px] font-bold">✝</text>
            </g>
          )}
        </g>
      </g>
    );
  };

  // Định dạng năm sinh - mất tóm tắt
  const formatLifespan = (member: Member): string => {
    const getYear = (dateStr: string | null) => {
      if (!dateStr) return "???";
      return new Date(dateStr).getFullYear();
    };
    
    if (member.isDead) {
      const birth = member.birthDate ? getYear(member.birthDate.toString()) : "???";
      const death = member.deathDate ? getYear(member.deathDate.toString()) : "???";
      return `${birth} - ${death}`;
    } else {
      const birth = member.birthDate ? getYear(member.birthDate.toString()) : "";
      return birth ? `Sinh năm ${birth}` : "Còn sống";
    }
  };

  return (
    <div className="relative w-full h-[78vh] bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Header & Điều khiển Tìm kiếm */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#8c1d1d]/80 border border-[#ffd700]/30 rounded-xl px-3 py-1.5 backdrop-blur-md">
          <Search className="h-4.5 w-4.5 text-[#ffd700] mr-2" />
          <input
            type="text"
            placeholder="Tìm tên thành viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-white placeholder-gray-400 text-sm focus:outline-none w-40 sm:w-56"
          />
          <button type="submit" className="hidden" />
        </form>

        <button 
          onClick={fitScreen}
          className="bg-stone-800/90 text-[#ffd700] p-2.5 rounded-xl border border-stone-700/60 hover:bg-[#8c1d1d] hover:border-[#ffd700]/40 transition-colors shadow-lg backdrop-blur-sm"
          title="Căn giữa màn hình"
        >
          <Maximize2 className="h-4.5 w-4.5" />
        </button>

        {selectedMember && (
          <button 
            onClick={() => setSelectedMember(null)}
            className="bg-[#8c1d1d]/90 text-[#ffd700] px-4 py-2 rounded-xl text-xs font-bold border border-[#ffd700]/30 shadow-lg hover:bg-[#701515] transition-all backdrop-blur-sm flex items-center space-x-1.5 cursor-pointer animate-in fade-in zoom-in duration-300"
            title="Hủy tập trung và hiển thị lại toàn bộ gia tộc"
          >
            <span>Hiện toàn bộ cây</span>
          </button>
        )}
      </div>

      {/* 2. Bộ điều khiển Zoom góc phải */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="bg-stone-800/95 text-white p-3 rounded-xl border border-stone-700 hover:bg-stone-700 transition-colors shadow-lg"
          title="Phóng to"
        >
          <ZoomIn className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-stone-800/95 text-white p-3 rounded-xl border border-stone-700 hover:bg-stone-700 transition-colors shadow-lg"
          title="Thu nhỏ"
        >
          <ZoomOut className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={resetView}
          className="bg-stone-800/95 text-white p-3 rounded-xl border border-stone-700 hover:bg-stone-700 transition-colors shadow-lg"
          title="Khôi phục góc nhìn"
        >
          <RotateCcw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Chú giải ý nghĩa các màu của Thẻ ở góc trái dưới */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 bg-stone-800/80 px-4 py-2 border border-stone-700/60 rounded-xl text-stone-300 text-xs backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-sky-600 rounded-sm"></span>
          <span>Nam giới</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-pink-500 rounded-sm"></span>
          <span>Nữ giới</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-stone-200 border border-stone-400 rounded-sm"></span>
          <span>Đã mất (✝)</span>
        </div>
      </div>

      {/* 3. Canvas vẽ SVG và di chuyển kéo thả */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg 
          width="100%" 
          height="100%" 
          style={{ pointerEvents: "none" }}
        >
          <defs>
            {/* Lưới nền tinh tế */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g 
            style={{ 
              pointerEvents: "all",
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              transformOrigin: "0 0"
            }}
          >
            {/* 1. Vẽ các đường nối trước (ở dưới) */}
            {layoutRoots.map(root => renderConnections(root))}

            {/* 2. Vẽ các Thẻ thành viên (ở trên) */}
            {layoutRoots.map(root => {
              const nodes: React.JSX.Element[] = [];
              const traverse = (n: LayoutNode) => {
                nodes.push(renderNode(n));
                n.children.forEach(traverse);
              };
              traverse(root);
              return nodes;
            })}
          </g>
        </svg>
      </div>

      {/* 4. Sidebar Chi tiết Thành viên (Glassmorphism Slide-in Drawer) */}
      {selectedMember && (
        <div className="absolute top-0 right-0 z-20 w-full sm:w-[400px] h-full bg-stone-900/95 border-l border-stone-800 shadow-2xl p-6 overflow-y-auto text-stone-200 transition-transform duration-300 backdrop-blur-md">
          <div className="flex justify-between items-start border-b border-stone-800 pb-4 mb-6">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                selectedMember.gender === "MALE" ? "bg-sky-900/60 text-sky-300" : "bg-pink-900/60 text-pink-300"
              }`}>
                Đời thứ {selectedMember.generation} - {selectedMember.gender === "MALE" ? "Nam" : "Nữ"}
              </span>
              <h2 className="font-serif text-2xl font-bold mt-1 text-[#ffd700]">
                {selectedMember.fullName}
              </h2>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="bg-stone-800 text-stone-400 p-1.5 rounded-lg hover:bg-stone-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Chân dung */}
            <div className="flex justify-center">
              <div className={`w-32 h-32 rounded-full border-2 overflow-hidden bg-stone-800 flex items-center justify-center ${
                selectedMember.gender === "MALE" ? "border-sky-500/40" : "border-pink-500/40"
              }`}>
                {selectedMember.photoUrl ? (
                  <img 
                    src={selectedMember.photoUrl} 
                    alt={selectedMember.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-stone-600" />
                )}
              </div>
            </div>

            {/* Chi nhánh / Ngành */}
            {selectedMember.branch && (
              <div className="bg-stone-800/50 rounded-xl p-3 border border-stone-800 text-sm">
                <span className="text-stone-500 block text-xs">Chi / Nhánh:</span>
                <span className="font-medium text-[#ffd700]">{selectedMember.branch}</span>
              </div>
            )}

            {/* Thông tin sự sống / ngày sinh / ngày mất */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <span className="text-xs text-stone-500">Ngày sinh:</span>
                  <p className="text-sm">
                    {selectedMember.birthDate 
                      ? new Date(selectedMember.birthDate).toLocaleDateString("vi-VN") 
                      : "Không rõ ngày dương"}
                    {selectedMember.birthDateLunar && (
                      <span className="block text-xs text-emerald-400/80">
                        (Âm lịch: {selectedMember.birthDateLunar})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {selectedMember.isDead ? (
                <>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-stone-500 mt-0.5" />
                    <div>
                      <span className="text-xs text-stone-500">Ngày mất (Tạ thế):</span>
                      <p className="text-sm">
                        {selectedMember.deathDate 
                          ? new Date(selectedMember.deathDate).toLocaleDateString("vi-VN") 
                          : "Không rõ ngày dương"}
                        {selectedMember.deathDateLunar && (
                          <span className="block text-xs text-stone-400">
                            (Âm lịch: {selectedMember.deathDateLunar})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedMember.placeOfBurial && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <span className="text-xs text-stone-500">Nơi an táng:</span>
                        <p className="text-sm text-stone-300">{selectedMember.placeOfBurial}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-950/40 border border-emerald-900/30 px-3 py-1.5 rounded-lg w-max">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hiện tại còn sống
                </div>
              )}

              {selectedMember.placeOfBirth && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-sky-500 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-500">Quê quán / Nơi sinh:</span>
                    <p className="text-sm text-stone-300">{selectedMember.placeOfBirth}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chi tiết cúng giỗ nếu có thiết lập ngày giỗ */}
            {selectedMember.isDead && selectedMember.deathAnniversary && (
              <div className="bg-[#8c1d1d]/20 border border-[#ffd700]/20 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-serif font-bold text-[#ffd700] border-b border-[#ffd700]/10 pb-1 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-[#ffd700]" />
                  Thông tin ngày giỗ (Kỵ nhật)
                </h4>
                <p className="text-sm text-stone-300">
                  Hàng năm vào ngày: <strong className="text-white">{selectedMember.deathAnniversary.lunarDay} tháng {selectedMember.deathAnniversary.lunarMonth} (Âm lịch)</strong>
                </p>
                {selectedMember.deathAnniversary.note && (
                  <p className="text-xs text-stone-400 italic">
                    Ghi chú: {selectedMember.deathAnniversary.note}
                  </p>
                )}
              </div>
            )}

            {/* Tiểu sử ngắn */}
            <div className="border-t border-stone-800 pt-4 space-y-2">
              <h4 className="text-sm font-bold text-stone-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-stone-400" />
                Tiểu sử cuộc đời
              </h4>
              <p className="text-sm text-stone-300 leading-relaxed font-serif whitespace-pre-line">
                {selectedMember.biography || "Lược sử chưa được cập nhật."}
              </p>
            </div>
            
            {/* Nút hành động */}
            <div className="border-t border-stone-800 pt-4 flex gap-2">
              <Link 
                href={`/members/${selectedMember.id}`}
                className="flex-grow text-center bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Hồ sơ chi tiết
              </Link>
              <Link 
                href={`/members/${selectedMember.id}/edit`}
                className="flex-grow text-center bg-[#8c1d1d] hover:bg-[#8c1d1d]/90 text-white py-2 rounded-xl text-xs font-semibold transition-colors border border-[#ffd700]/20"
              >
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
