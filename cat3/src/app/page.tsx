'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────
type Screen = 'main' | 'stage' | 'game' | 'shop' | 'result'
type CatId = 'cheese' | 'calico' | 'black'
type ItemId = 'hairband' | 'sunglasses' | 'necklace' | 'crown' | 'ribbon' | 'monocle'
type BlockType = '⭐' | '🧀' | '🐟' | '💝' | '🐾' | '🍬'

interface Cat {
  id: CatId
  name: string
  emoji: string
  color: string
  bgGradient: string
  borderColor: string
  textColor: string
  tagline: string
  accessories: string
}

interface StageConfig {
  id: number
  goal: number
  moves: number
  gridSize: number
}

interface ShopItem {
  id: ItemId
  name: string
  emoji: string
  price: number
  slot: 'head' | 'eyes' | 'neck'
}

interface Cell {
  type: BlockType
  id: number
  popping: boolean
  falling: boolean
  matched: boolean
}

type Board = (Cell | null)[][]

interface ComboEffect {
  id: number
  combo: number
  x: number
  y: number
}

// ────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────────────────
const CATS: Cat[] = [
  {
    id: 'cheese',
    name: '치즈냥',
    emoji: '🧡',
    color: '#F59E0B',
    bgGradient: 'from-yellow-200 via-amber-100 to-orange-100',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    tagline: '모험가 치즈냥',
    accessories: '베레모 & 치즈 망토',
  },
  {
    id: 'calico',
    name: '삼색냥',
    emoji: '🩷',
    color: '#EC4899',
    bgGradient: 'from-pink-200 via-rose-100 to-fuchsia-100',
    borderColor: 'border-pink-400',
    textColor: 'text-pink-700',
    tagline: '러블리 삼색냥',
    accessories: '체크 리본 & 프릴 드레스',
  },
  {
    id: 'black',
    name: '마법냥',
    emoji: '💜',
    color: '#7C3AED',
    bgGradient: 'from-violet-200 via-purple-100 to-indigo-100',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-700',
    tagline: '마법사 마법냥',
    accessories: '초승달 & 마법사 망토',
  },
]

const STAGES: StageConfig[] = [
  { id: 1, goal: 300, moves: 20, gridSize: 6 },
  { id: 2, goal: 500, moves: 22, gridSize: 6 },
  { id: 3, goal: 700, moves: 24, gridSize: 7 },
  { id: 4, goal: 1000, moves: 25, gridSize: 7 },
  { id: 5, goal: 1300, moves: 26, gridSize: 7 },
  { id: 6, goal: 1600, moves: 28, gridSize: 8 },
  { id: 7, goal: 2000, moves: 28, gridSize: 8 },
  { id: 8, goal: 2500, moves: 30, gridSize: 8 },
  { id: 9, goal: 3000, moves: 30, gridSize: 8 },
  { id: 10, goal: 4000, moves: 35, gridSize: 8 },
]

const SHOP_ITEMS: ShopItem[] = [
  { id: 'hairband', name: '별 머리띠', emoji: '⭐', price: 3, slot: 'head' },
  { id: 'crown', name: '왕관', emoji: '👑', price: 5, slot: 'head' },
  { id: 'sunglasses', name: '선글라스', emoji: '😎', price: 4, slot: 'eyes' },
  { id: 'monocle', name: '모노클', emoji: '🧐', price: 6, slot: 'eyes' },
  { id: 'necklace', name: '하트 목걸이', emoji: '💖', price: 3, slot: 'neck' },
  { id: 'ribbon', name: '리본 넥타이', emoji: '🎀', price: 4, slot: 'neck' },
]

const BLOCK_TYPES: BlockType[] = ['⭐', '🧀', '🐟', '💝', '🐾', '🍬']

const BLOCK_COLORS: Record<BlockType, string> = {
  '⭐': 'from-yellow-300 to-amber-400',
  '🧀': 'from-orange-300 to-yellow-400',
  '🐟': 'from-blue-300 to-cyan-400',
  '💝': 'from-pink-300 to-rose-400',
  '🐾': 'from-purple-300 to-violet-400',
  '🍬': 'from-green-300 to-teal-400',
}

const BLOCK_SHADOW: Record<BlockType, string> = {
  '⭐': 'shadow-yellow-400/50',
  '🧀': 'shadow-orange-400/50',
  '🐟': 'shadow-blue-400/50',
  '💝': 'shadow-pink-400/50',
  '🐾': 'shadow-purple-400/50',
  '🍬': 'shadow-green-400/50',
}

const BLOCK_NAMES: Record<BlockType, string> = {
  '⭐': '별사탕',
  '🧀': '치즈조각',
  '🐟': '미니생선',
  '💝': '하트젤리',
  '🐾': '발바닥쿠키',
  '🍬': '마법사탕',
}

let cellIdCounter = 0
function newCell(type: BlockType): Cell {
  return { type, id: cellIdCounter++, popping: false, falling: false, matched: false }
}

// ────────────────────────────────────────────────────────────────────────────
// BOARD LOGIC
// ────────────────────────────────────────────────────────────────────────────
function randomType(): BlockType {
  return BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
}

function findMatches(board: Board, size: number): [number, number][] {
  const matched = new Set<string>()

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 2; c++) {
      const a = board[r][c], b = board[r][c + 1], cc = board[r][c + 2]
      if (a && b && cc && a.type === b.type && b.type === cc.type) {
        matched.add(`${r},${c}`)
        matched.add(`${r},${c + 1}`)
        matched.add(`${r},${c + 2}`)
      }
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 2; r++) {
      const a = board[r][c], b = board[r + 1][c], cc = board[r + 2][c]
      if (a && b && cc && a.type === b.type && b.type === cc.type) {
        matched.add(`${r},${c}`)
        matched.add(`${r + 1},${c}`)
        matched.add(`${r + 2},${c}`)
      }
    }
  }
  return [...matched].map(k => k.split(',').map(Number) as [number, number])
}

function createBoard(size: number): Board {
  let attempts = 0
  while (attempts < 1000) {
    const board: Board = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => newCell(randomType()))
    )
    if (findMatches(board, size).length === 0) return board
    attempts++
  }
  // fallback: create carefully
  const board: Board = Array.from({ length: size }, () => new Array(size).fill(null))
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const forbidden = new Set<BlockType>()
      if (c >= 2) {
        const a = board[r][c - 1], b = board[r][c - 2]
        if (a && b && a.type === b.type) forbidden.add(a.type)
      }
      if (r >= 2) {
        const a = board[r - 1][c], b = board[r - 2][c]
        if (a && b && a.type === b.type) forbidden.add(a.type)
      }
      const choices = BLOCK_TYPES.filter(t => !forbidden.has(t))
      board[r][c] = newCell(choices.length > 0 ? choices[Math.floor(Math.random() * choices.length)] : randomType())
    }
  }
  return board
}

function applyGravity(board: Board, size: number): Board {
  const next = board.map(row => [...row])
  for (let c = 0; c < size; c++) {
    const col = next.map(row => row[c]).filter(Boolean) as Cell[]
    for (let r = 0; r < size; r++) {
      if (r < size - col.length) {
        next[r][c] = null
      } else {
        const cell = col[r - (size - col.length)]
        next[r][c] = { ...cell, falling: true }
      }
    }
  }
  return next
}

function fillBoard(board: Board, size: number): Board {
  const next = board.map(row => [...row])
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!next[r][c]) {
        next[r][c] = { ...newCell(randomType()), falling: true }
      }
    }
  }
  return next
}

// ────────────────────────────────────────────────────────────────────────────
// CAT SVG COMPONENTS
// ────────────────────────────────────────────────────────────────────────────
function CheeseCat({ size = 80, items = [] }: { size?: number; items?: ItemId[] }) {
  const hasHead = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'head'))
  const hasEyes = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'eyes'))
  const hasNeck = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'neck'))
  const headItem = SHOP_ITEMS.find(s => s.id === hasHead)
  const eyeItem = SHOP_ITEMS.find(s => s.id === hasEyes)
  const neckItem = SHOP_ITEMS.find(s => s.id === hasNeck)

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tail */}
      <path d="M67 88 Q85 75 80 61 Q75 52 67 60" stroke="#F59E0B" strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="50" cy="83" rx="23" ry="15" fill="#FBBF24"/>
      {/* Cheese cape */}
      <ellipse cx="50" cy="80" rx="25" ry="14" fill="#FDE68A"/>
      <path d="M26 80 Q31 89 37 83 Q42 90 48 84 Q52 90 57 83 Q63 89 69 83 Q74 89 75 80" stroke="#EAB308" strokeWidth="2.5" fill="none"/>
      <circle cx="40" cy="77" r="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1.3"/>
      <circle cx="58" cy="82" r="3.2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.1"/>
      <circle cx="46" cy="86" r="2.6" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
      <circle cx="40.5" cy="77.5" r="2.2" fill="#D97706" opacity="0.45"/>
      <circle cx="58.5" cy="82.5" r="1.7" fill="#D97706" opacity="0.45"/>
      {/* Neck base */}
      <ellipse cx="50" cy="69" rx="11" ry="7" fill="#FBBF24"/>
      {/* Ears */}
      <polygon points="25,30 16,8 38,24" fill="#FBBF24"/>
      <polygon points="75,30 84,8 62,24" fill="#FBBF24"/>
      <polygon points="26,29 19,13 37,24" fill="#FCA5A5" opacity="0.75"/>
      <polygon points="74,29 81,13 63,24" fill="#FCA5A5" opacity="0.75"/>
      {/* Head */}
      <circle cx="50" cy="44" r="27" fill="#FBBF24"/>
      {/* Tabby forehead stripes */}
      <path d="M43 22 Q50 19 57 22" stroke="#D97706" strokeWidth="2" fill="none" opacity="0.4"/>
      <path d="M44 27 Q50 25 56 27" stroke="#D97706" strokeWidth="1.5" fill="none" opacity="0.3"/>
      {/* Eyes */}
      {(!hasEyes || hasEyes === 'monocle') && (
        <>
          <circle cx="37" cy="43" r="9.5" fill="white"/>
          <circle cx="37" cy="44.5" r="6.5" fill="#78350F"/>
          <circle cx="39.5" cy="41" r="2.5" fill="white"/>
          <circle cx="36.5" cy="46" r="1.5" fill="#1C0A00" opacity="0.6"/>
          <circle cx="63" cy="43" r="9.5" fill="white"/>
          <circle cx="63" cy="44.5" r="6.5" fill="#78350F"/>
          <circle cx="65.5" cy="41" r="2.5" fill="white"/>
          <circle cx="62.5" cy="46" r="1.5" fill="#1C0A00" opacity="0.6"/>
        </>
      )}
      {/* Nose */}
      <ellipse cx="50" cy="54" rx="4" ry="2.8" fill="#FCA5A5"/>
      {/* Mouth + teeth + tongue */}
      <path d="M44 58 Q47 63 50 61.5 Q53 63 56 58" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="47" y="58" width="3" height="4" rx="1.2" fill="white" opacity="0.9"/>
      <rect x="50.5" y="58" width="3" height="4" rx="1.2" fill="white" opacity="0.9"/>
      <ellipse cx="50" cy="62.5" rx="3.5" ry="2" fill="#FCA5A5" opacity="0.7"/>
      {/* Blush */}
      <ellipse cx="27" cy="54" rx="6" ry="3.5" fill="#FCA5A5" opacity="0.4"/>
      <ellipse cx="73" cy="54" rx="6" ry="3.5" fill="#FCA5A5" opacity="0.4"/>
      {/* Whiskers */}
      <line x1="9" y1="50" x2="33" y2="53" stroke="#92400E" strokeWidth="1.1" opacity="0.5"/>
      <line x1="9" y1="55" x2="33" y2="55" stroke="#92400E" strokeWidth="1.1" opacity="0.5"/>
      <line x1="67" y1="53" x2="91" y2="50" stroke="#92400E" strokeWidth="1.1" opacity="0.5"/>
      <line x1="67" y1="55" x2="91" y2="55" stroke="#92400E" strokeWidth="1.1" opacity="0.5"/>
      {/* Beret (default) */}
      {!hasHead && (
        <>
          <ellipse cx="50" cy="20" rx="23" ry="6.5" fill="#CA8A04"/>
          <ellipse cx="50" cy="14" rx="21" ry="11" fill="#EAB308"/>
          <ellipse cx="50" cy="13" rx="19" ry="9" fill="#FBBF24" opacity="0.45"/>
          <circle cx="50" cy="5" r="6" fill="#EAB308"/>
          <circle cx="50" cy="4.5" r="4" fill="#CA8A04"/>
        </>
      )}
    </svg>
  )
}

function CalicoCat({ size = 80, items = [] }: { size?: number; items?: ItemId[] }) {
  const hasHead = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'head'))
  const hasEyes = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'eyes'))
  const hasNeck = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'neck'))
  const headItem = SHOP_ITEMS.find(s => s.id === hasHead)
  const eyeItem = SHOP_ITEMS.find(s => s.id === hasEyes)
  const neckItem = SHOP_ITEMS.find(s => s.id === hasNeck)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tail */}
      <path d="M68 87 Q86 74 81 60 Q76 51 68 59" stroke="#FEF3C7" strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Body / frilly dress */}
      <ellipse cx="50" cy="83" rx="25" ry="15" fill="#FDF2F8"/>
      {/* Calico patches on body */}
      <ellipse cx="37" cy="79" rx="10" ry="7" fill="#F97316" opacity="0.32"/>
      <ellipse cx="62" cy="85" rx="8" ry="6" fill="#1C1917" opacity="0.2"/>
      {/* Frilly hem */}
      <path d="M26 83 Q30 91 36 85 Q40 92 46 86 Q50 93 54 86 Q60 92 65 85 Q71 91 74 83" stroke="#FBCFE8" strokeWidth="3" fill="none"/>
      {/* Heart on dress */}
      <path d="M50 85 C50 85 46 82 46 80 C46 78.5 47.2 78 48 78.7 C48.5 78.2 49.2 78 50 78 C50.8 78 51.5 78.2 52 78.7 C52.8 78 54 78.5 54 80 C54 82 50 85 50 85 Z" fill="#EC4899" opacity="0.5"/>
      {/* Neck base */}
      <ellipse cx="50" cy="69" rx="11" ry="7" fill="#FEF3C7"/>
      {/* Default collar ribbon */}
      {!hasNeck && (
        <rect x="36" y="66" width="28" height="7" rx="3.5" fill="#EC4899" opacity="0.7"/>
      )}
      {/* Ears */}
      <polygon points="25,29 16,7 38,23" fill="#FEF3C7"/>
      <polygon points="75,29 84,7 62,23" fill="#FEF3C7"/>
      <polygon points="26,28 19,12 37,23" fill="#FCA5A5" opacity="0.7"/>
      <polygon points="74,28 81,12 63,23" fill="#FCA5A5" opacity="0.7"/>
      {/* Calico patch on left ear */}
      <polygon points="26,27 20,14 33,23" fill="#F97316" opacity="0.38"/>
      {/* Head */}
      <circle cx="50" cy="44" r="27" fill="#FEF3C7"/>
      {/* Calico patches on head */}
      <ellipse cx="33" cy="37" rx="12" ry="10" fill="#F97316" opacity="0.32"/>
      <ellipse cx="66" cy="47" rx="10" ry="8" fill="#1C1917" opacity="0.18"/>
      {/* Eyes */}
      {(!hasEyes || hasEyes === 'monocle') && (
        <>
          <ellipse cx="37" cy="43" rx="9.5" ry="8.5" fill="white"/>
          <ellipse cx="37.5" cy="44" rx="6" ry="6.5" fill="#92400E"/>
          <circle cx="40" cy="41" r="2.3" fill="white"/>
          <circle cx="37" cy="45.5" r="1.3" fill="#1C0A00" opacity="0.5"/>
          <ellipse cx="63" cy="43" rx="9.5" ry="8.5" fill="white"/>
          <ellipse cx="63.5" cy="44" rx="6" ry="6.5" fill="#92400E"/>
          <circle cx="66" cy="41" r="2.3" fill="white"/>
          <circle cx="63" cy="45.5" r="1.3" fill="#1C0A00" opacity="0.5"/>
        </>
      )}
      {/* Nose */}
      <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#FCA5A5"/>
      {/* Mouth */}
      <path d="M45 57.5 Q50 61.5 55 57.5" stroke="#92400E" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="27" cy="53" rx="5.5" ry="3.5" fill="#FCA5A5" opacity="0.4"/>
      <ellipse cx="73" cy="53" rx="5.5" ry="3.5" fill="#FCA5A5" opacity="0.4"/>
      {/* Whiskers */}
      <line x1="9" y1="50" x2="33" y2="53" stroke="#78350F" strokeWidth="1" opacity="0.45"/>
      <line x1="9" y1="55" x2="33" y2="55" stroke="#78350F" strokeWidth="1" opacity="0.45"/>
      <line x1="67" y1="53" x2="91" y2="50" stroke="#78350F" strokeWidth="1" opacity="0.45"/>
      <line x1="67" y1="55" x2="91" y2="55" stroke="#78350F" strokeWidth="1" opacity="0.45"/>
      {/* Pink checkered bow (default) */}
      {!hasHead && (
        <>
          <path d="M24 18 L37 13 L35 25 Z" fill="#EC4899"/>
          <rect x="25" y="16" width="5" height="5" rx="0.8" fill="#FB7185" opacity="0.55"/>
          <rect x="30" y="14" width="4" height="4" rx="0.8" fill="#FBCFE8" opacity="0.7"/>
          <rect x="27" y="21" width="5" height="4" rx="0.8" fill="#FBCFE8" opacity="0.65"/>
          <path d="M76 18 L63 13 L65 25 Z" fill="#EC4899"/>
          <rect x="70" y="16" width="5" height="5" rx="0.8" fill="#FB7185" opacity="0.55"/>
          <rect x="66" y="14" width="4" height="4" rx="0.8" fill="#FBCFE8" opacity="0.7"/>
          <rect x="68" y="21" width="5" height="4" rx="0.8" fill="#FBCFE8" opacity="0.65"/>
          <circle cx="50" cy="19" r="7" fill="#DB2777"/>
          <circle cx="50" cy="19" r="4.5" fill="#EC4899"/>
          <text x="50" y="22" textAnchor="middle" fontSize="7" fill="white" opacity="0.9">★</text>
        </>
      )}
    </svg>
  )
}

function BlackCat({ size = 80, items = [] }: { size?: number; items?: ItemId[] }) {
  const hasHead = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'head'))
  const hasEyes = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'eyes'))
  const hasNeck = items.find(i => SHOP_ITEMS.find(s => s.id === i && s.slot === 'neck'))
  const headItem = SHOP_ITEMS.find(s => s.id === hasHead)
  const eyeItem = SHOP_ITEMS.find(s => s.id === hasEyes)
  const neckItem = SHOP_ITEMS.find(s => s.id === hasNeck)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Magic wand (back layer) */}
      <line x1="66" y1="92" x2="84" y2="60" stroke="#C4B5FD" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="85" cy="57" r="5.5" fill="#FDE047"/>
      <path d="M85 49 L87 54.5 H93 L88.5 57.5 L90 63 L85 60 L80 63 L81.5 57.5 L77 54.5 H83 Z" fill="#FDE047" opacity="0.9"/>
      {/* Tail */}
      <path d="M67 87 Q85 74 80 60 Q76 51 68 59" stroke="#312E81" strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Wizard cloak body */}
      <ellipse cx="50" cy="83" rx="24" ry="15" fill="#1E1B4B"/>
      <ellipse cx="50" cy="80" rx="25" ry="14" fill="#312E81"/>
      {/* Cloak wavy hem */}
      <path d="M26 80 Q30 88 36 83 Q40 90 46 84 Q50 91 54 84 Q60 90 65 83 Q70 88 74 80" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.7"/>
      {/* Gold trim */}
      <path d="M26 80 Q50 86 74 80" stroke="#FDE047" strokeWidth="1.5" fill="none" opacity="0.55"/>
      {/* Stars on cloak */}
      <text x="33" y="76" fontSize="8" fill="#FDE047" opacity="0.9">✦</text>
      <text x="47" y="82" fontSize="6" fill="#A78BFA" opacity="0.9">✦</text>
      <text x="60" y="75" fontSize="8" fill="#FDE047" opacity="0.9">✦</text>
      <text x="54" y="88" fontSize="5" fill="#C4B5FD" opacity="0.8">⋆</text>
      {/* Neck base */}
      <ellipse cx="50" cy="69" rx="11" ry="7" fill="#2D2B40"/>
      {/* Default cloak collar */}
      {!hasNeck && (
        <path d="M36 67 Q50 64 64 67 Q60 72 50 71 Q40 72 36 67 Z" fill="#7C3AED" opacity="0.85"/>
      )}
      {/* Ears */}
      <polygon points="25,30 15,7 38,23" fill="#1C1917"/>
      <polygon points="75,30 85,7 62,23" fill="#1C1917"/>
      <polygon points="26,29 18,12 37,23" fill="#7C3AED" opacity="0.65"/>
      <polygon points="74,29 82,12 63,23" fill="#7C3AED" opacity="0.65"/>
      {/* Head */}
      <circle cx="50" cy="44" r="27" fill="#1C1917"/>
      {/* Eyes */}
      {(!hasEyes || hasEyes === 'monocle') && (
        <>
          {/* Left eye – fully open */}
          <circle cx="37" cy="43" r="9.5" fill="#4ADE80"/>
          <ellipse cx="37" cy="44.5" rx="6" ry="7.5" fill="#166534"/>
          <circle cx="39.5" cy="40.5" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="37" cy="46" r="1.5" fill="#052E16" opacity="0.7"/>
          {/* Right eye – slightly squinted */}
          <circle cx="63" cy="44" r="9" fill="#4ADE80"/>
          <ellipse cx="63" cy="45" rx="5.5" ry="7" fill="#166534"/>
          <circle cx="65.5" cy="41.5" r="2.2" fill="white" opacity="0.9"/>
          <circle cx="63" cy="46.5" r="1.3" fill="#052E16" opacity="0.7"/>
          {/* Squint eyelid line */}
          <path d="M55 40 Q63 37 71 40" stroke="#1C1917" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </>
      )}
      {/* Nose */}
      <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#A78BFA"/>
      {/* Mouth */}
      <path d="M45 57.5 Q50 61.5 55 57.5" stroke="#7C3AED" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="27" cy="53" rx="5.5" ry="3.5" fill="#A78BFA" opacity="0.22"/>
      <ellipse cx="73" cy="53" rx="5.5" ry="3.5" fill="#A78BFA" opacity="0.22"/>
      {/* Whiskers */}
      <line x1="9" y1="50" x2="33" y2="53" stroke="#A78BFA" strokeWidth="1.1" opacity="0.55"/>
      <line x1="9" y1="55" x2="33" y2="55" stroke="#A78BFA" strokeWidth="1.1" opacity="0.55"/>
      <line x1="67" y1="53" x2="91" y2="50" stroke="#A78BFA" strokeWidth="1.1" opacity="0.55"/>
      <line x1="67" y1="55" x2="91" y2="55" stroke="#A78BFA" strokeWidth="1.1" opacity="0.55"/>
      {/* Crescent moon (default head) */}
      {!hasHead && (
        <>
          <circle cx="50" cy="13" r="9.5" fill="#FDE047"/>
          <circle cx="54.5" cy="11" r="7.5" fill="#1C1917"/>
        </>
      )}
    </svg>
  )
}

function CatDisplay({ catId, size = 80, items = [] }: { catId: CatId; size?: number; items?: ItemId[] }) {
  const headItem = SHOP_ITEMS.find(s => items.includes(s.id) && s.slot === 'head')
  const eyeItem  = SHOP_ITEMS.find(s => items.includes(s.id) && s.slot === 'eyes')
  const neckItem = SHOP_ITEMS.find(s => items.includes(s.id) && s.slot === 'neck')
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      {catId === 'cheese' && <CheeseCat size={size} items={items} />}
      {catId === 'calico' && <CalicoCat size={size} items={items} />}
      {catId !== 'cheese' && catId !== 'calico' && <BlackCat size={size} items={items} />}
      {/* HTML overlays — emoji renders correctly outside SVG */}
      {headItem && (
        <div style={{
          position: 'absolute', top: size * 0.02, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: size * 0.31, lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>
          {headItem.emoji}
        </div>
      )}
      {eyeItem?.id === 'sunglasses' && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, pointerEvents: 'none', userSelect: 'none' }}
             viewBox="0 0 100 100" fill="none">
          {/* Left lens */}
          <circle cx="37" cy="43" r="12" fill="rgba(10,10,18,0.88)"/>
          <circle cx="37" cy="43" r="12" stroke="#111" strokeWidth="2.5"/>
          {/* Right lens */}
          <circle cx="63" cy="43" r="12" fill="rgba(10,10,18,0.88)"/>
          <circle cx="63" cy="43" r="12" stroke="#111" strokeWidth="2.5"/>
          {/* Bridge */}
          <path d="M49 41 Q50 39 51 41" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Left arm */}
          <line x1="25" y1="40" x2="8" y2="38" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Right arm */}
          <line x1="75" y1="40" x2="92" y2="38" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Shine */}
          <ellipse cx="31" cy="38" rx="4.5" ry="2.5" fill="white" opacity="0.22" transform="rotate(-25 31 38)"/>
          <ellipse cx="57" cy="38" rx="4.5" ry="2.5" fill="white" opacity="0.22" transform="rotate(-25 57 38)"/>
        </svg>
      )}
      {eyeItem?.id === 'monocle' && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, pointerEvents: 'none', userSelect: 'none' }}
             viewBox="0 0 100 100" fill="none">
          {/* Lens over right eye */}
          <circle cx="63" cy="43" r="13" fill="rgba(180,220,255,0.15)"/>
          <circle cx="63" cy="43" r="13" stroke="#C8A84B" strokeWidth="3"/>
          {/* Shine */}
          <ellipse cx="57" cy="37" rx="4.5" ry="2.8" fill="white" opacity="0.28" transform="rotate(-25 57 37)"/>
          {/* Chain */}
          <path d="M50 53 Q42 61 34 65 Q26 69 20 71" stroke="#C8A84B" strokeWidth="1.8" strokeLinecap="round" opacity="0.85"/>
        </svg>
      )}
      {eyeItem && eyeItem.id !== 'sunglasses' && eyeItem.id !== 'monocle' && (
        <div style={{
          position: 'absolute', top: size * 0.36, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: size * 0.25, lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>
          {eyeItem.emoji}
        </div>
      )}
      {neckItem && (
        <div style={{
          position: 'absolute', top: size * 0.65, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: size * 0.17, lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>
          {neckItem.emoji}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// BLOCK GRAPHIC SVG COMPONENTS (Cookie Run Kingdom Style)
// ────────────────────────────────────────────────────────────────────────────
function StarCandyIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Drop shadow */}
      <path d="M18 5.5L21.3 13.8H31L23.7 19L26.5 27.5L18 22.5L9.5 27.5L12.3 19L5 13.8H14.7Z"
        fill="#92400E" opacity="0.25" transform="translate(0.5,1.8)"/>
      {/* Body */}
      <path d="M18 5.5L21.3 13.8H31L23.7 19L26.5 27.5L18 22.5L9.5 27.5L12.3 19L5 13.8H14.7Z"
        fill="#FBBF24" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
      {/* Inner warm gradient sim */}
      <path d="M18 8L20.5 14.5H27.5L22 18.5L24 24.5L18 21L12 24.5L14 18.5L8.5 14.5H15.5Z"
        fill="#FDE68A" opacity="0.55"/>
      {/* Top shine */}
      <ellipse cx="13.5" cy="13" rx="3" ry="1.6" fill="white" opacity="0.65" transform="rotate(-25 13.5 13)"/>
      {/* Eyes */}
      <ellipse cx="15.5" cy="19.5" rx="1.6" ry="1.9" fill="#78350F"/>
      <ellipse cx="20.5" cy="19.5" rx="1.6" ry="1.9" fill="#78350F"/>
      <circle cx="16.1" cy="18.6" r="0.75" fill="white"/>
      <circle cx="21.1" cy="18.6" r="0.75" fill="white"/>
      {/* Smile */}
      <path d="M15 22.5 Q18 25.5 21 22.5" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="12.5" cy="22.5" rx="2" ry="1.1" fill="#FCA5A5" opacity="0.55"/>
      <ellipse cx="23.5" cy="22.5" rx="2" ry="1.1" fill="#FCA5A5" opacity="0.55"/>
      {/* Tiny sparkles */}
      <circle cx="27" cy="9" r="1.2" fill="white" opacity="0.9"/>
      <circle cx="8" cy="22" r="0.9" fill="white" opacity="0.7"/>
    </svg>
  )
}

function CheeseIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <path d="M3 29L18 8L33 29Z" fill="#92400E" opacity="0.2" transform="translate(0,1.5)"/>
      {/* Rind bottom */}
      <rect x="3" y="25.5" width="30" height="5.5" rx="2.5" fill="#F59E0B" stroke="white" strokeWidth="1.8"/>
      {/* Main wedge */}
      <path d="M3 27L18 8L33 27Z" fill="#FCD34D" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
      {/* Inner lighter area */}
      <path d="M18 11L29 27H7Z" fill="#FDE68A" opacity="0.5"/>
      {/* Holes */}
      <circle cx="14.5" cy="22" r="3.2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.2"/>
      <circle cx="23.5" cy="19" r="2.6" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
      <circle cx="11.5" cy="15" r="2.1" fill="#F59E0B" stroke="#D97706" strokeWidth="0.9"/>
      {/* Inner hole depth */}
      <circle cx="14.5" cy="22.5" r="1.5" fill="#D97706" opacity="0.5"/>
      <circle cx="23.5" cy="19.5" r="1.2" fill="#D97706" opacity="0.5"/>
      <circle cx="11.5" cy="15.5" r="1" fill="#D97706" opacity="0.5"/>
      {/* Shine */}
      <ellipse cx="12" cy="11.5" rx="2.5" ry="1.4" fill="white" opacity="0.65" transform="rotate(-30 12 11.5)"/>
    </svg>
  )
}

function FishIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="19" cy="20" rx="14" ry="7.5" fill="#0369A1" opacity="0.2" transform="translate(0,2)"/>
      {/* Tail fin */}
      <path d="M7 18L2 10L2 26Z" fill="#38BDF8" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M7 18L4 10L4 26Z" fill="#7DD3FC" opacity="0.6"/>
      {/* Body */}
      <ellipse cx="21" cy="18" rx="13" ry="8.5" fill="#38BDF8" stroke="white" strokeWidth="2.2"/>
      {/* Belly */}
      <ellipse cx="21" cy="20" rx="10" ry="5" fill="#BAE6FD" opacity="0.55"/>
      {/* Top fin */}
      <path d="M15 9.5L18.5 5.5L23.5 9.5" fill="#0EA5E9" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Scale arcs */}
      <path d="M11 13 Q14 18 11 23" stroke="#7DD3FC" strokeWidth="1.4" fill="none" opacity="0.85" strokeLinecap="round"/>
      <path d="M16.5 12 Q19.5 18 16.5 24" stroke="#7DD3FC" strokeWidth="1.4" fill="none" opacity="0.85" strokeLinecap="round"/>
      <path d="M22 13 Q25 18 22 23" stroke="#7DD3FC" strokeWidth="1.4" fill="none" opacity="0.85" strokeLinecap="round"/>
      {/* Eye white */}
      <circle cx="28.5" cy="16" r="4.2" fill="white" stroke="white" strokeWidth="0.5"/>
      {/* Iris */}
      <circle cx="29" cy="16" r="2.7" fill="#1D4ED8"/>
      {/* Pupil */}
      <circle cx="29" cy="16" r="1.5" fill="#1E3A8A"/>
      {/* Eye shine */}
      <circle cx="30" cy="14.5" r="1.1" fill="white"/>
      {/* Mouth */}
      <path d="M32.5 18.5 Q34 20.5 32.5 22" stroke="#0369A1" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Body highlight */}
      <ellipse cx="16" cy="13.5" rx="3.5" ry="1.8" fill="white" opacity="0.45" transform="rotate(-20 16 13.5)"/>
      {/* Bubbles */}
      <circle cx="5" cy="8" r="1.2" fill="white" opacity="0.7"/>
      <circle cx="8" cy="5" r="0.8" fill="white" opacity="0.5"/>
    </svg>
  )
}

function HeartJellyIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <path d="M18 33C18 33 4 23.5 4 14.5C4 10.2 7.2 7 11.5 7C14.2 7 16.5 8.7 18 11C19.5 8.7 21.8 7 24.5 7C28.8 7 32 10.2 32 14.5C32 23.5 18 33 18 33Z"
        fill="#9D174D" opacity="0.22" transform="translate(0,1.8)"/>
      {/* Outer heart */}
      <path d="M18 33C18 33 4 23.5 4 14.5C4 10.2 7.2 7 11.5 7C14.2 7 16.5 8.7 18 11C19.5 8.7 21.8 7 24.5 7C28.8 7 32 10.2 32 14.5C32 23.5 18 33 18 33Z"
        fill="#F472B6" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
      {/* Inner heart (lighter) */}
      <path d="M18 29C18 29 7.5 20.5 7.5 14.5C7.5 11.8 9.5 10 12 10C14 10 15.5 11.3 18 14C20.5 11.3 22 10 24 10C26.5 10 28.5 11.8 28.5 14.5C28.5 20.5 18 29 18 29Z"
        fill="#FB7185" opacity="0.6"/>
      {/* Jelly inner glow */}
      <path d="M18 25C18 25 11 19 11 14.5C11 12.5 12.5 11.5 14 11.5C15.5 11.5 16.5 12.5 18 14.5C19.5 12.5 20.5 11.5 22 11.5C23.5 11.5 25 12.5 25 14.5C25 19 18 25 18 25Z"
        fill="#FECDD3" opacity="0.45"/>
      {/* Big shine */}
      <ellipse cx="11.5" cy="11" rx="4" ry="2.2" fill="white" opacity="0.7" transform="rotate(-20 11.5 11)"/>
      {/* Star sparkle */}
      <path d="M25 19.5L25.7 21.5H27.8L26.1 22.7L26.8 24.7L25 23.5L23.2 24.7L23.9 22.7L22.2 21.5H24.3Z"
        fill="white" opacity="0.85"/>
      {/* Eyes */}
      <circle cx="15" cy="17.5" r="1.4" fill="#BE185D"/>
      <circle cx="21" cy="17.5" r="1.4" fill="#BE185D"/>
      <circle cx="15.5" cy="17" r="0.6" fill="white"/>
      <circle cx="21.5" cy="17" r="0.6" fill="white"/>
    </svg>
  )
}

function PawCookieIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="18" cy="24" rx="9.5" ry="8" fill="#78350F" opacity="0.22" transform="translate(0,1.5)"/>
      {/* Main pad */}
      <ellipse cx="18" cy="23" rx="9.5" ry="8.5" fill="#D97706" stroke="white" strokeWidth="2.2"/>
      {/* Baked top surface */}
      <ellipse cx="18" cy="22" rx="8" ry="7" fill="#F59E0B" opacity="0.6"/>
      {/* Cookie crack lines */}
      <path d="M11 20.5 Q15 18.5 18 20 Q21 18.5 25 20.5" stroke="#B45309" strokeWidth="0.9" fill="none" opacity="0.7"/>
      <path d="M12 24 Q15 22 18 23.5 Q21 22 24 24" stroke="#B45309" strokeWidth="0.9" fill="none" opacity="0.7"/>
      {/* Heart on main pad */}
      <path d="M18 27.5C18 27.5 15.5 25.5 15.5 24C15.5 23 16.3 22.5 17 23C17.5 22.5 18 22.5 18 22.5C18 22.5 18.5 22.5 19 23C19.7 22.5 20.5 23 20.5 24C20.5 25.5 18 27.5 18 27.5Z"
        fill="#B45309" opacity="0.6"/>
      {/* Toe pads */}
      <circle cx="10" cy="14.5" r="4.5" fill="#F59E0B" stroke="white" strokeWidth="2"/>
      <circle cx="18" cy="12" r="4.5" fill="#F59E0B" stroke="white" strokeWidth="2"/>
      <circle cx="26" cy="14.5" r="4.5" fill="#F59E0B" stroke="white" strokeWidth="2"/>
      {/* Toe surface baked */}
      <circle cx="10" cy="14" r="3" fill="#FCD34D" opacity="0.6"/>
      <circle cx="18" cy="11.5" r="3" fill="#FCD34D" opacity="0.6"/>
      <circle cx="26" cy="14" r="3" fill="#FCD34D" opacity="0.6"/>
      {/* Sugar glaze lines on toes */}
      <path d="M8 13 Q10 14.5 12 13" stroke="#B45309" strokeWidth="0.8" fill="none" opacity="0.6"/>
      <path d="M16 10.5 Q18 12 20 10.5" stroke="#B45309" strokeWidth="0.8" fill="none" opacity="0.6"/>
      <path d="M24 13 Q26 14.5 28 13" stroke="#B45309" strokeWidth="0.8" fill="none" opacity="0.6"/>
      {/* Shine spots */}
      <circle cx="9.5" cy="13" r="1.5" fill="white" opacity="0.65"/>
      <circle cx="17.5" cy="10.5" r="1.5" fill="white" opacity="0.65"/>
      <circle cx="25.5" cy="13" r="1.5" fill="white" opacity="0.65"/>
      <circle cx="15" cy="21.5" r="1.2" fill="white" opacity="0.5"/>
    </svg>
  )
}

function MagicCandyIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stick */}
      <rect x="16.5" y="25.5" width="3" height="8" rx="1.5" fill="#E9D5FF" stroke="white" strokeWidth="1"/>
      {/* Shadow */}
      <circle cx="18" cy="18" r="12" fill="#4C1D95" opacity="0.22" transform="translate(0,2)"/>
      {/* Main candy disk */}
      <circle cx="18" cy="17" r="12" fill="#7C3AED" stroke="white" strokeWidth="2.2"/>
      {/* Swirl outer */}
      <path d="M18 5C25.2 5 31 10.8 31 18C31 25.2 25.2 31 18 31C10.8 31 5 25.2 5 18"
        stroke="#A855F7" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Swirl inner */}
      <path d="M18 9C23 9 27 13 27 18C27 23 23 27 18 27C13 27 9 23 9 18"
        stroke="#C084FC" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Swirl core */}
      <path d="M18 13C20.8 13 23 15.2 23 18C23 20.8 20.8 23 18 23"
        stroke="#DDD6FE" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Center circle */}
      <circle cx="18" cy="17" r="3.5" fill="#6D28D9"/>
      <circle cx="18" cy="17" r="2" fill="#8B5CF6"/>
      {/* Big shine */}
      <ellipse cx="12.5" cy="11.5" rx="3.5" ry="2" fill="white" opacity="0.5" transform="rotate(-30 12.5 11.5)"/>
      {/* Sparkle star top-right */}
      <path d="M26 6L26.7 8H28.8L27.1 9.2L27.8 11.2L26 10L24.2 11.2L24.9 9.2L23.2 8H25.3Z"
        fill="#FDE047" opacity="0.95"/>
      {/* Sparkle bottom-left */}
      <path d="M7 22L7.5 23.5H9.2L7.8 24.4L8.3 25.9L7 25L5.7 25.9L6.2 24.4L4.8 23.5H6.5Z"
        fill="#FDE047" opacity="0.85"/>
      {/* Small dots */}
      <circle cx="29" cy="16" r="1" fill="white" opacity="0.7"/>
      <circle cx="7" cy="13" r="0.8" fill="white" opacity="0.6"/>
    </svg>
  )
}

function BlockGraphic({ type, size }: { type: BlockType; size: number }) {
  const s = Math.round(size * 0.82)
  switch (type) {
    case '⭐': return <StarCandyIcon size={s} />
    case '🧀': return <CheeseIcon size={s} />
    case '🐟': return <FishIcon size={s} />
    case '💝': return <HeartJellyIcon size={s} />
    case '🐾': return <PawCookieIcon size={s} />
    case '🍬': return <MagicCandyIcon size={s} />
    default:   return null
  }
}

// ────────────────────────────────────────────────────────────────────────────
// BLOCK COMPONENT
// ────────────────────────────────────────────────────────────────────────────
function Block({
  cell,
  size,
  selected,
  hint,
  onPointerDown,
  onPointerEnter,
}: {
  cell: Cell
  size: number
  selected: boolean
  hint: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onPointerEnter: () => void
}) {
  return (
    <div
      className={`
        relative flex items-center justify-center rounded-xl cursor-pointer
        bg-gradient-to-br ${BLOCK_COLORS[cell.type]}
        shadow-md ${BLOCK_SHADOW[cell.type]}
        border-2 transition-all duration-150
        ${selected ? 'border-white scale-110 z-10 shadow-xl ring-2 ring-white/60' : 'border-white/50'}
        ${hint ? 'animate-pulse border-yellow-300' : ''}
        ${cell.popping ? 'animate-pop' : ''}
        ${cell.falling ? 'animate-fall' : ''}
        active:scale-95
      `}
      style={{ width: size, height: size }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
    >
      {/* Inner bevel highlight */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      {/* Bottom shadow */}
      <div className="absolute inset-x-1 bottom-0.5 h-1.5 rounded-full bg-black/10 pointer-events-none" />
      {/* Block illustration */}
      <BlockGraphic type={cell.type} size={size - 4} />
      {selected && (
        <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN GAME COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export default function CatPuzzleGame() {
  // ── state ──
  const [screen, setScreen] = useState<Screen>('main')
  const [selectedCat, setSelectedCat] = useState<CatId | null>(null)
  const [selectedStage, setSelectedStage] = useState<number>(1)
  const [clearedStages, setClearedStages] = useState<Set<number>>(new Set())
  const [cans, setCans] = useState(10)
  const [ownedItems, setOwnedItems] = useState<ItemId[]>([])
  const [equippedItems, setEquippedItems] = useState<ItemId[]>([])

  // game state
  const [board, setBoard] = useState<Board>([])
  const [gridSize, setGridSize] = useState(6)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(20)
  const [goalScore, setGoalScore] = useState(300)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [comboEffects, setComboEffects] = useState<ComboEffect[]>([])
  const [shakeCell, setShakeCell] = useState<[number, number] | null>(null)
  const [dragStart, setDragStart] = useState<[number, number] | null>(null)
  const [dragVisual, setDragVisual] = useState<{ row: number; col: number; x: number; y: number } | null>(null)
  const [gamePhase, setGamePhase] = useState<'playing' | 'checking' | 'over' | 'clear'>('playing')
  const [resultData, setResultData] = useState<{ cleared: boolean; canEarned: number; score: number; maxCombo: number } | null>(null)
  const [goalPopupShown, setGoalPopupShown] = useState(false)
  const [showGoalPopup, setShowGoalPopup] = useState(false)
  const [cansGiven, setCansGiven] = useState(false)

  const [catMood, setCatMood] = useState<'idle' | 'match' | 'combo' | 'celebrate'>('idle')

  const boardRef = useRef<HTMLDivElement>(null)
  const comboIdRef = useRef(0)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const comboCarryRef = useRef(0)
  const comboResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const catMoodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── helpers ──
  const getCellSize = useCallback(() => {
    if (typeof window === 'undefined') return 44
    const vw = Math.min(window.innerWidth, 448) // max-w-md = 448px
    const padding = 24 // p-3 on each side
    return Math.floor((vw - padding * 2) / gridSize)
  }, [gridSize])

  const [cellSize, setCellSize] = useState(44)

  useEffect(() => {
    const update = () => setCellSize(getCellSize())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [getCellSize])

  // ── game init ──
  const startGame = useCallback((cat: CatId, stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId)!
    setSelectedCat(cat)
    setSelectedStage(stageId)
    setGridSize(stage.gridSize)
    setBoard(createBoard(stage.gridSize))
    setScore(0)
    setMoves(stage.moves)
    setGoalScore(stage.goal)
    setSelectedCell(null)
    setIsAnimating(false)
    setCombo(0)
    setMaxCombo(0)
    setComboEffects([])
    setGamePhase('playing')
    setResultData(null)
    setGoalPopupShown(false)
    setShowGoalPopup(false)
    setCansGiven(false)
    setCatMood('idle')
    comboCarryRef.current = 0
    setScreen('game')
  }, [])

  // ── match processing ──
  const processMatches = useCallback((currentBoard: Board, currentSize: number, currentCombo: number, currentScore: number): void => {
    const matched = findMatches(currentBoard, currentSize)
    if (matched.length === 0) {
      // Save combo carry for next swap within 5 seconds
      comboCarryRef.current = currentCombo
      if (comboResetTimerRef.current) clearTimeout(comboResetTimerRef.current)
      comboResetTimerRef.current = setTimeout(() => {
        comboCarryRef.current = 0
        setCombo(0)
        setCatMood('idle')
      }, 5000)
      setIsAnimating(false)
      return
    }

    const newCombo = currentCombo + 1
    setCombo(newCombo)
    setMaxCombo(prev => Math.max(prev, newCombo))

    // Update cat mood based on combo level
    const mood = newCombo >= 3 ? 'combo' : 'match'
    if (catMoodTimerRef.current) clearTimeout(catMoodTimerRef.current)
    setCatMood(mood)
    catMoodTimerRef.current = setTimeout(() => setCatMood('idle'), mood === 'combo' ? 700 : 550)

    // mark popping
    const poppingBoard = currentBoard.map(row => row.map(cell => cell ? { ...cell } : null))
    matched.forEach(([r, c]) => {
      if (poppingBoard[r][c]) poppingBoard[r][c]!.popping = true
    })
    setBoard(poppingBoard)

    // show combo effect
    if (newCombo >= 2) {
      const midIdx = Math.floor(matched.length / 2)
      const [mr, mc] = matched[midIdx]
      const effectId = ++comboIdRef.current
      setComboEffects(prev => [...prev, { id: effectId, combo: newCombo, x: mc, y: mr }])
      setTimeout(() => setComboEffects(prev => prev.filter(e => e.id !== effectId)), 1200)
    }

    const points = matched.length * 50 * (newCombo >= 2 ? newCombo : 1)
    const nextScore = currentScore + points
    setScore(nextScore)

    animTimerRef.current = setTimeout(() => {
      // remove matched
      let next = currentBoard.map(row => row.map(cell => cell ? { ...cell } : null))
      matched.forEach(([r, c]) => { next[r][c] = null })
      next = applyGravity(next, currentSize)
      next = fillBoard(next, currentSize)

      // clear falling after animation
      setTimeout(() => {
        setBoard(prev => prev.map(row => row.map(cell => cell ? { ...cell, falling: false, popping: false } : null)))
      }, 280)

      setBoard(next)
      animTimerRef.current = setTimeout(() => {
        processMatches(next, currentSize, newCombo, nextScore)
      }, 320)
    }, 320)
  }, [])

  // ── swap ──
  const trySwap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    if (isAnimating) return
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return
    if (!board[r1]?.[c1] || !board[r2]?.[c2]) return

    setIsAnimating(true)
    setSelectedCell(null)

    const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null))
    const tmp = newBoard[r1][c1]
    newBoard[r1][c1] = newBoard[r2][c2]
    newBoard[r2][c2] = tmp
    setBoard(newBoard)

    const matched = findMatches(newBoard, gridSize)
    if (matched.length === 0) {
      // revert
      setShakeCell([r2, c2])
      setTimeout(() => {
        const reverted = newBoard.map(row => row.map(cell => cell ? { ...cell } : null))
        const t2 = reverted[r1][c1]
        reverted[r1][c1] = reverted[r2][c2]
        reverted[r2][c2] = t2
        setBoard(reverted)
        setShakeCell(null)
        setIsAnimating(false)
      }, 320)
    } else {
      setMoves(prev => {
        const next = prev - 1
        return next
      })
      // Clear the 5s reset timer — a new match is starting
      if (comboResetTimerRef.current) clearTimeout(comboResetTimerRef.current)
      animTimerRef.current = setTimeout(() => {
        processMatches(newBoard, gridSize, comboCarryRef.current, score)
      }, 50)
    }
  }, [isAnimating, board, gridSize, score, processMatches])

  // ── game over / clear detection ──
  useEffect(() => {
    if (gamePhase !== 'playing') return
    if (isAnimating) return
    if (moves <= 0) {
      const cleared = score >= goalScore
      let canEarned = 0
      if (cleared && !cansGiven) {
        canEarned = 1 + (maxCombo >= 5 ? 2 : maxCombo >= 3 ? 1 : 0)
        setCans(prev => prev + canEarned)
        setClearedStages(prev => new Set([...prev, selectedStage]))
      }
      if (cleared) setCatMood('celebrate')
      setGamePhase(cleared ? 'clear' : 'over')
      setResultData({ cleared, canEarned, score, maxCombo })
    }
  }, [moves, isAnimating, gamePhase, score, goalScore, maxCombo, selectedStage, cansGiven])

  // cleanup on unmount
  useEffect(() => {
    return () => { if (animTimerRef.current) clearTimeout(animTimerRef.current) }
  }, [])

  // ── goal achievement detection ──
  useEffect(() => {
    if (gamePhase !== 'playing') return
    if (goalPopupShown) return
    if (score >= goalScore) {
      setGoalPopupShown(true)
      setShowGoalPopup(true)
    }
  }, [score, goalScore, gamePhase, goalPopupShown])

  const handleEarlyFinish = useCallback(() => {
    setShowGoalPopup(false)
    const canEarned = cansGiven ? 0 : 1 + (maxCombo >= 5 ? 2 : maxCombo >= 3 ? 1 : 0)
    if (!cansGiven) {
      setCans(prev => prev + canEarned)
      setClearedStages(prev => new Set([...prev, selectedStage]))
      setCansGiven(true)
    }
    setResultData({ cleared: true, canEarned, score, maxCombo })
    setGamePhase('clear')
  }, [cansGiven, maxCombo, score, selectedStage])

  const handleNextStageFromGoal = useCallback(() => {
    setShowGoalPopup(false)
    if (!cansGiven) {
      const canEarned = 1 + (maxCombo >= 5 ? 2 : maxCombo >= 3 ? 1 : 0)
      setCans(prev => prev + canEarned)
      setClearedStages(prev => new Set([...prev, selectedStage]))
    }
    startGame(selectedCat!, selectedStage + 1)
  }, [cansGiven, maxCombo, selectedStage, selectedCat, startGame])

  // ── pointer handling ──
  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (isAnimating || gamePhase !== 'playing') return
    if (!selectedCell) {
      setSelectedCell([r, c])
      setDragStart([r, c])
      setDragVisual({ row: r, col: c, x: e.clientX, y: e.clientY })
    } else {
      const [sr, sc] = selectedCell
      if (sr === r && sc === c) {
        setSelectedCell(null)
        setDragVisual(null)
      } else if (Math.abs(sr - r) + Math.abs(sc - c) === 1) {
        trySwap(sr, sc, r, c)
        setDragVisual(null)
      } else {
        setSelectedCell([r, c])
        setDragStart([r, c])
        setDragVisual({ row: r, col: c, x: e.clientX, y: e.clientY })
      }
    }
  }

  const handlePointerEnter = (r: number, c: number) => {
    if (!dragStart || isAnimating || gamePhase !== 'playing') return
    const [dr, dc] = dragStart
    if (Math.abs(dr - r) + Math.abs(dc - c) === 1) {
      setDragStart(null)
      trySwap(dr, dc, r, c)
    }
  }

  // ── shop ──
  const buyItem = (item: ShopItem) => {
    if (cans < item.price || ownedItems.includes(item.id)) return
    setCans(prev => prev - item.price)
    setOwnedItems(prev => [...prev, item.id])
  }

  const toggleEquip = (itemId: ItemId) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)!
    setEquippedItems(prev => {
      const hasSlot = prev.find(id => SHOP_ITEMS.find(s => s.id === id && s.slot === item.slot))
      if (hasSlot) {
        if (hasSlot === itemId) return prev.filter(id => id !== itemId)
        return [...prev.filter(id => id !== hasSlot), itemId]
      }
      return [...prev, itemId]
    })
  }

  // ────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ────────────────────────────────────────────────────────────────────────

  // ── MAIN SCREEN ──
  if (screen === 'main') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-pink-200 via-amber-100 to-yellow-200 flex flex-col items-center justify-center overflow-hidden relative">
        {/* decorative bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float"
              style={{
                left: `${(i * 17 + 5) % 95}%`,
                top: `${(i * 13 + 8) % 85}%`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0.25,
              }}
            >
              {['🍪', '⭐', '🧡', '🌸', '🎀', '✨', '🍬', '💝', '🐾', '🌟', '🎵', '🌈'][i]}
            </div>
          ))}
          {/* gingerbread style houses hint */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-300/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-sm">
          {/* Title */}
          <div className="text-center">
            <div className="text-5xl mb-2 animate-bounce">🐱</div>
            <h1 className="text-4xl font-black text-pink-600 drop-shadow-lg" style={{ textShadow: '2px 2px 0 #fff, 4px 4px 0 #f9a8d4' }}>
              냥냥 퍼즐
            </h1>
            <p className="text-xl font-bold text-amber-600 mt-1" style={{ textShadow: '1px 1px 0 #fff' }}>
              킹덤 🏰
            </p>
            <p className="text-sm text-pink-500 mt-1 font-medium">고양이들의 달콤한 모험!</p>
          </div>

          {/* Cat Selection */}
          <div className="w-full bg-white/70 backdrop-blur rounded-3xl p-4 shadow-xl border-2 border-pink-200">
            <p className="text-center text-sm font-bold text-pink-600 mb-3">✨ 고양이를 선택하세요 ✨</p>
            <div className="flex gap-2 justify-center">
              {CATS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`
                    flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl border-3 transition-all duration-200
                    ${selectedCat === cat.id
                      ? `bg-gradient-to-b ${cat.bgGradient} ${cat.borderColor} border-4 scale-105 shadow-lg`
                      : 'bg-white/60 border-gray-200 hover:scale-102'
                    }
                  `}
                  style={{ borderWidth: selectedCat === cat.id ? 3 : 2 }}
                >
                  <CatDisplay catId={cat.id} size={64} items={selectedCat === cat.id ? equippedItems : []} />
                  <span className={`text-xs font-black ${cat.textColor}`}>{cat.name}</span>
                  <span className="text-xs text-gray-500 leading-tight text-center">{cat.accessories}</span>
                  {selectedCat === cat.id && (
                    <div className={`w-full text-center text-xs py-0.5 rounded-full font-bold ${cat.textColor} bg-white/60`}>
                      선택됨 ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                if (selectedCat) setScreen('stage')
                else {
                  setSelectedCat('calico')
                  setScreen('stage')
                }
              }}
              className="w-full py-4 rounded-2xl text-xl font-black text-white shadow-lg active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)', boxShadow: '0 4px 0 #be185d' }}
            >
              🎮 게임 시작!
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setScreen('shop')}
                className="flex-1 py-3 rounded-2xl text-base font-bold text-white active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 3px 0 #6d28d9' }}
              >
                🛍️ 상점
              </button>
              <div className="flex-1 py-3 rounded-2xl text-base font-bold text-amber-700 bg-amber-100 border-2 border-amber-300 flex items-center justify-center gap-1">
                🥫 {cans}개
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── STAGE SCREEN ──
  if (screen === 'stage') {
    const cat = CATS.find(c => c.id === selectedCat)!
    return (
      <div className={`min-h-screen w-full bg-gradient-to-b ${cat.bgGradient} flex flex-col items-center overflow-y-auto`}>
        <div className="w-full max-w-sm px-4 py-6 flex flex-col gap-4">
          {/* header */}
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('main')} className="p-2 rounded-full bg-white/70 active:scale-95">
              ←
            </button>
            <div className="flex items-center gap-2 flex-1">
              <CatDisplay catId={selectedCat!} size={44} items={equippedItems} />
              <div>
                <p className="font-black text-lg" style={{ color: cat.color }}>{cat.name}</p>
                <p className="text-xs text-gray-500">{cat.tagline}</p>
              </div>
            </div>
            <div className="text-sm font-bold text-amber-600 bg-white/70 rounded-full px-3 py-1">
              🥫 {cans}
            </div>
          </div>

          <h2 className="text-2xl font-black text-center" style={{ color: cat.color }}>
            🗺️ 스테이지 선택
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {STAGES.map(stage => {
              const unlocked = stage.id === 1 || clearedStages.has(stage.id - 1)
              const cleared = clearedStages.has(stage.id)
              return (
                <button
                  key={stage.id}
                  onClick={() => unlocked && startGame(selectedCat!, stage.id)}
                  disabled={!unlocked}
                  className={`
                    relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95
                    ${cleared ? `bg-gradient-to-br ${cat.bgGradient} ${cat.borderColor} shadow-md` :
                      unlocked ? 'bg-white/80 border-gray-200 shadow-sm hover:shadow-md' :
                      'bg-gray-100 border-gray-200 opacity-60'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-black text-gray-700">
                      {cleared ? '⭐' : unlocked ? '🔓' : '🔒'} {stage.id}스테이지
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">목표: {stage.goal.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">이동: {stage.moves}회 · {stage.gridSize}×{stage.gridSize}</p>
                  {cleared && (
                    <div className="absolute top-2 right-2 text-xs font-bold text-green-600 bg-green-100 rounded-full px-2 py-0.5">
                      클리어!
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── SHOP SCREEN ──
  if (screen === 'shop') {
    const cat = CATS.find(c => c.id === (selectedCat || 'calico'))!
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-violet-200 via-purple-100 to-pink-100 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-sm px-4 py-6 flex flex-col gap-4">
          {/* header */}
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('main')} className="p-2 rounded-full bg-white/70 active:scale-95">
              ←
            </button>
            <h2 className="flex-1 text-2xl font-black text-purple-700 text-center">🛍️ 아이템 상점</h2>
            <div className="text-sm font-bold text-amber-600 bg-white/70 rounded-full px-3 py-1">
              🥫 {cans}
            </div>
          </div>

          {/* preview */}
          <div className="bg-white/70 rounded-3xl p-4 flex flex-col items-center gap-2 shadow-lg border-2 border-purple-200">
            <p className="text-xs font-bold text-purple-500 mb-1">착용 미리보기</p>
            <CatDisplay catId={selectedCat || 'calico'} size={100} items={equippedItems} />
            <p className="text-sm font-bold text-gray-600">{cat.name}</p>
            {equippedItems.length > 0 ? (
              <div className="flex gap-2 flex-wrap justify-center">
                {equippedItems.map(id => {
                  const item = SHOP_ITEMS.find(s => s.id === id)!
                  return (
                    <span key={id} className="text-xs bg-purple-100 text-purple-600 rounded-full px-2 py-0.5 font-medium">
                      {item.emoji} {item.name}
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">아이템을 착용해 보세요!</p>
            )}
          </div>

          {/* items */}
          <div className="grid grid-cols-2 gap-3">
            {SHOP_ITEMS.map(item => {
              const owned = ownedItems.includes(item.id)
              const equipped = equippedItems.includes(item.id)
              const canBuy = cans >= item.price && !owned
              return (
                <div
                  key={item.id}
                  className={`
                    p-3 rounded-2xl border-2 bg-white/80
                    ${equipped ? 'border-purple-400 bg-purple-50' : owned ? 'border-green-300' : 'border-gray-200'}
                    shadow-sm
                  `}
                >
                  <div className="text-3xl text-center mb-1">{item.emoji}</div>
                  <p className="text-sm font-bold text-center text-gray-700">{item.name}</p>
                  <p className="text-xs text-center text-gray-400 mb-2">슬롯: {item.slot === 'head' ? '머리' : item.slot === 'eyes' ? '눈' : '목'}</p>
                  {owned ? (
                    <button
                      onClick={() => toggleEquip(item.id)}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        equipped
                          ? 'bg-purple-500 text-white'
                          : 'bg-green-100 text-green-700 border border-green-300'
                      }`}
                    >
                      {equipped ? '✓ 착용중' : '착용하기'}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyItem(item)}
                      disabled={!canBuy}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        canBuy
                          ? 'bg-amber-400 text-white hover:bg-amber-500'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      🥫 {item.price}개
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── RESULT OVERLAY (inside game screen) ──
  const showResult = gamePhase === 'clear' || gamePhase === 'over'

  // ── GAME SCREEN ──
  if (screen === 'game') {
    const cat = CATS.find(c => c.id === selectedCat)!
    const progressPct = Math.min(100, Math.round((score / goalScore) * 100))

    return (
      <div className={`min-h-screen w-full bg-gradient-to-b ${cat.bgGradient} flex flex-col items-center overflow-hidden relative`}>

        {/* ── TOP HUD ── */}
        <div className="w-full max-w-md px-3 pt-3 pb-2">
          {/* row 1: cat info + cans */}
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setScreen('stage')} className="p-1.5 rounded-full bg-white/60 text-sm active:scale-95">
              ←
            </button>
            <div className="flex items-center gap-2 bg-white/70 rounded-2xl px-2 py-1 flex-1">
              <div className={`flex-shrink-0 ${
                catMood === 'celebrate' ? 'animate-cat-celebrate' :
                catMood === 'combo' ? 'animate-cat-combo' :
                catMood === 'match' ? 'animate-cat-match' : ''
              }`} style={{ transformOrigin: 'bottom center' }}>
                <CatDisplay catId={selectedCat!} size={60} items={equippedItems} />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: cat.color }}>{cat.name}</p>
                <div className="flex gap-1 flex-wrap">
                  {equippedItems.map(id => {
                    const item = SHOP_ITEMS.find(s => s.id === id)!
                    return <span key={id} className="text-xs">{item.emoji}</span>
                  })}
                  {equippedItems.length === 0 && <span className="text-xs text-gray-400">장착 없음</span>}
                </div>
              </div>
            </div>
            <div className="bg-white/70 rounded-2xl px-2 py-1 text-center">
              <p className="text-xs text-gray-500">스테이지</p>
              <p className="text-base font-black text-gray-700">{selectedStage}</p>
            </div>
            <div className="bg-white/70 rounded-2xl px-2 py-1 text-center">
              <p className="text-xs text-gray-500">이동</p>
              <p className={`text-base font-black ${moves <= 5 ? 'text-red-600' : 'text-gray-700'}`}>{moves}</p>
            </div>
          </div>

          {/* row 2: score progress */}
          <div className="bg-white/70 rounded-2xl px-3 py-2">
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
              <span>점수: {score.toLocaleString()}</span>
              <span>목표: {goalScore.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${cat.color} 0%, #fff 200%)`,
                  backgroundImage: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)`,
                }}
              />
            </div>
            {combo >= 2 && (
              <div className="mt-1 text-center">
                <span
                  className="text-xs font-black animate-pulse"
                  style={{ color: cat.color }}
                >
                  🔥 {combo} COMBO!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── DRAG GHOST ── */}
        {dragVisual && board[dragVisual.row]?.[dragVisual.col] && (
          <div style={{
            position: 'fixed',
            left: dragVisual.x,
            top: dragVisual.y,
            width: cellSize - 4,
            height: cellSize - 4,
            transform: 'translate(-50%, -50%) scale(1.18)',
            zIndex: 1000,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))',
          }}>
            <Block
              cell={board[dragVisual.row][dragVisual.col]!}
              size={cellSize - 4}
              selected={false}
              hint={false}
              onPointerDown={(_e) => {}}
              onPointerEnter={() => {}}
            />
          </div>
        )}

        {/* ── BOARD ── */}
        <div
          ref={boardRef}
          className="relative w-full max-w-md px-3 flex-1 flex items-start justify-center"
          onPointerLeave={() => setDragStart(null)}
        >
          <div
            className="relative"
            style={{ width: cellSize * gridSize + 4, height: cellSize * gridSize + 4, touchAction: 'none' }}
            onTouchMove={(e) => {
              if (!dragStart || isAnimating || gamePhase !== 'playing') return
              const touch = e.touches[0]
              setDragVisual(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null)
            }}
            onTouchEnd={(e) => {
              if (dragStart) {
                const touch = e.changedTouches[0]
                const el = document.elementFromPoint(touch.clientX, touch.clientY)
                const cellEl = el?.closest('[data-row]') as HTMLElement | null
                if (cellEl) {
                  const tr = parseInt(cellEl.dataset.row!)
                  const tc = parseInt(cellEl.dataset.col!)
                  const [dr, dc] = dragStart
                  if (!isNaN(tr) && !isNaN(tc) && Math.abs(dr - tr) + Math.abs(dc - tc) === 1) {
                    trySwap(dr, dc, tr, tc)
                  }
                }
              }
              setDragStart(null)
              setDragVisual(null)
            }}
          >
            {/* board bg */}
            <div
              className="absolute inset-0 rounded-2xl bg-white/40 shadow-xl border-2 border-white/60"
              style={{ backdropFilter: 'blur(4px)' }}
            />

            {/* cells */}
            <div className="relative p-0.5">
              {board.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => {
                    if (!cell) return (
                      <div key={c} style={{ width: cellSize, height: cellSize }} className="p-0.5" />
                    )
                    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c
                    const isShaking = shakeCell?.[0] === r && shakeCell?.[1] === c
                    return (
                      <div
                        key={cell.id}
                        className={`p-0.5 ${isShaking ? 'animate-shake' : ''}`}
                        style={{
                          width: cellSize, height: cellSize,
                          opacity: dragVisual?.row === r && dragVisual?.col === c ? 0.25 : 1,
                          transition: 'opacity 0.1s',
                        }}
                        data-row={r}
                        data-col={c}
                      >
                        <Block
                          cell={cell}
                          size={cellSize - 4}
                          selected={isSelected}
                          hint={false}
                          onPointerDown={(e) => handlePointerDown(r, c, e)}
                          onPointerEnter={() => handlePointerEnter(r, c)}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* combo effects */}
            {comboEffects.map(effect => (
              <div
                key={effect.id}
                className="absolute pointer-events-none z-20 animate-combo"
                style={{
                  left: effect.x * cellSize + cellSize / 2,
                  top: effect.y * cellSize,
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  className="px-3 py-1 rounded-full font-black text-white text-sm shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, #FF6B9D)` }}
                >
                  {effect.combo} COMBO! 🔥
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* block legend */}
        <div className="w-full max-w-md px-3 pb-3">
          <div className="bg-white/50 rounded-xl px-3 py-1.5 flex gap-1 flex-wrap justify-center">
            {BLOCK_TYPES.map(t => (
              <div key={t} className="flex items-center gap-0.5">
                <span className="text-sm">{t}</span>
                <span className="text-xs text-gray-500">{BLOCK_NAMES[t]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── GOAL ACHIEVED POPUP ── */}
        {showGoalPopup && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-bounce-in flex flex-col items-center gap-4"
              style={{ border: '3px solid #10B981' }}
            >
              <div className="text-5xl animate-bounce">🎯</div>
              <h2 className="text-2xl font-black text-green-600">목표달성!</h2>
              <p className="text-sm text-gray-500 text-center">
                목표 점수 {goalScore.toLocaleString()}점을 달성했어요!<br/>
                더 높은 점수를 노리거나 다음으로 진행하세요.
              </p>
              <div className="w-full bg-green-50 rounded-2xl p-3 flex justify-between items-center">
                <span className="text-sm text-gray-500">현재 점수</span>
                <span className="text-xl font-black text-green-700">{score.toLocaleString()}점</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {selectedStage < 10 && (
                  <button
                    onClick={handleNextStageFromGoal}
                    className="w-full py-3.5 rounded-2xl font-bold text-white active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', boxShadow: '0 4px 0 #1d4ed8' }}
                  >
                    ➡️ 다음 스테이지
                  </button>
                )}
                <button
                  onClick={handleEarlyFinish}
                  className="w-full py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 border-2 border-gray-200 active:scale-95 transition-all"
                >
                  🏁 지금 종료하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT MODAL ── */}
        {showResult && resultData && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-bounce-in flex flex-col items-center gap-4"
              style={{ border: `3px solid ${cat.color}` }}
            >
              <div className="text-5xl">{resultData.cleared ? '🎉' : '😿'}</div>
              <h2 className="text-2xl font-black" style={{ color: cat.color }}>
                {resultData.cleared ? '스테이지 클리어!' : '게임 오버'}
              </h2>
              <div className="w-full bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">최종 점수</span>
                  <span className="font-black text-gray-700">{resultData.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">목표 점수</span>
                  <span className="font-bold text-gray-600">{goalScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">최고 콤보</span>
                  <span className="font-black" style={{ color: cat.color }}>{resultData.maxCombo} 콤보</span>
                </div>
                {resultData.cleared && (
                  <>
                    <hr />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">기본 보상</span>
                      <span className="font-bold text-amber-600">🥫 +1개</span>
                    </div>
                    {resultData.maxCombo >= 3 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">콤보 보너스</span>
                        <span className="font-bold text-amber-600">
                          🥫 +{resultData.maxCombo >= 5 ? 2 : 1}개
                          ({resultData.maxCombo >= 5 ? '5콤보↑' : '3콤보↑'})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black">
                      <span className="text-amber-700">총 획득</span>
                      <span className="text-amber-600">🥫 {resultData.canEarned}개</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => startGame(selectedCat!, selectedStage)}
                  className="flex-1 py-3 rounded-2xl font-bold text-white active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, #FF6B9D)` }}
                >
                  🔄 다시하기
                </button>
                <button
                  onClick={() => setScreen('stage')}
                  className="flex-1 py-3 rounded-2xl font-bold text-gray-700 bg-gray-100 border-2 border-gray-200 active:scale-95"
                >
                  🗺️ 스테이지
                </button>
              </div>

              {resultData.cleared && selectedStage < 10 && (
                <button
                  onClick={() => startGame(selectedCat!, selectedStage + 1)}
                  className="w-full py-3 rounded-2xl font-black text-white active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 3px 0 #047857' }}
                >
                  ➡️ 다음 스테이지!
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
