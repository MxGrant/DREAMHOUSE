'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { LayoutItem } from '@/lib/types'

type Room3DProps = {
  room: { width_cm: number; length_cm: number; wall_color: string; floor_color: string }
  items: LayoutItem[]
  badge?: string
}

const M = 0.01
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function material(color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.82, metalness: 0.04, ...extra })
}

function box(w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color))
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function buildItem(item: LayoutItem, roomW: number, roomL: number): THREE.Group {
  const group = new THREE.Group()
  const w = item.w * M
  const d = item.d * M
  const h = clamp(item.h * M, 0.05, 2.6)
  const color = item.color || '#E7DCCD'

  switch (item.category) {
    case 'rug': {
      group.add(box(w, 0.015, d, color, 0, 0.008, 0))
      group.add(box(w - 0.16, 0.02, d - 0.16, color, 0, 0.011, 0))
      break
    }
    case 'sofa': {
      group.add(box(w, 0.36, d, color, 0, 0.2, 0))
      group.add(box(w, 0.46, 0.2, color, 0, 0.56, -d / 2 + 0.1))
      group.add(box(0.14, 0.3, d, color, -w / 2 + 0.07, 0.5, 0))
      group.add(box(0.14, 0.3, d, color, w / 2 - 0.07, 0.5, 0))
      const cushion = box(w / 2 - 0.2, 0.14, d * 0.62, color, -w / 4 + 0.04, 0.42, 0.04)
      group.add(cushion)
      group.add(box(w / 2 - 0.2, 0.14, d * 0.62, color, w / 4 - 0.04, 0.42, 0.04))
      break
    }
    case 'chair': {
      group.add(box(w * 0.86, 0.09, d * 0.86, color, 0, 0.44, 0))
      group.add(box(w * 0.92, 0.5, 0.08, color, 0, 0.7, -d / 2 + 0.05))
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          group.add(box(0.05, 0.42, 0.05, '#8a6b52', sx * (w / 2 - 0.06), 0.21, sz * (d / 2 - 0.06)))
        }
      }
      break
    }
    case 'bed': {
      group.add(box(w, 0.26, d, '#dcbd9a', 0, 0.16, 0))
      group.add(box(w - 0.06, 0.22, d - 0.08, '#fffaf2', 0, 0.4, 0.02))
      group.add(box(w, 0.62, 0.1, color, 0, 0.6, -d / 2 + 0.05))
      group.add(box(w * 0.4, 0.1, 0.32, '#ffffff', -w * 0.22, 0.56, -d / 2 + 0.28))
      group.add(box(w * 0.4, 0.1, 0.32, '#ffffff', w * 0.22, 0.56, -d / 2 + 0.28))
      group.add(box(w - 0.02, 0.08, d * 0.45, color, 0, 0.52, d * 0.2))
      break
    }
    case 'table':
    case 'desk': {
      const top = Math.min(0.76, h)
      group.add(box(w, 0.06, d, color, 0, top, 0))
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          group.add(box(0.055, top, 0.055, '#9a7a5d', sx * (w / 2 - 0.08), top / 2, sz * (d / 2 - 0.08)))
        }
      }
      break
    }
    case 'wardrobe': {
      group.add(box(w, h, d, color, 0, h / 2, 0))
      group.add(box(0.02, h * 0.82, 0.02, '#e9dfd2', 0, h / 2, d / 2 + 0.005))
      break
    }
    case 'kitchen': {
      const base = Math.min(0.92, h)
      group.add(box(w, base, d, color, 0, base / 2, 0))
      group.add(box(w + 0.03, 0.06, d + 0.03, '#f4efe6', 0, base + 0.02, 0))
      group.add(box(w * 0.22, 0.02, d * 0.42, '#d8dde0', -w * 0.16, base + 0.06, 0))
      break
    }
    case 'lamp': {
      const poleH = clamp(h * 0.78, 0.3, 2.1)
      group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 20), material('#c8a887')))
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, poleH, 12), material('#c9a568', { metalness: 0.5, roughness: 0.4 }))
      pole.position.y = poleH / 2 + 0.02
      pole.castShadow = true
      group.add(pole)
      const shade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.26, 0.26, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color(color), emissiveIntensity: 0.35 }),
      )
      shade.position.y = poleH + 0.14
      group.add(shade)
      const glow = new THREE.PointLight(new THREE.Color(color), 0.6, 3.2)
      glow.position.y = poleH + 0.1
      group.add(glow)
      break
    }
    case 'plant': {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.34, w * 0.42, 0.3, 18), material('#d9c3ad'))
      pot.position.y = 0.15
      pot.castShadow = true
      group.add(pot)
      const leafMat = material(color, { roughness: 0.75 })
      const heights = [0.55, 0.78, 0.98, 0.7, 0.9]
      heights.forEach((hh, i) => {
        const r = 0.18 + (i % 3) * 0.06
        const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafMat)
        const angle = (i / heights.length) * Math.PI * 2
        blob.position.set(Math.cos(angle) * (r * 0.9), hh, Math.sin(angle) * (r * 0.9))
        blob.castShadow = true
        group.add(blob)
      })
      break
    }
    case 'decor': {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.28, w * 0.34, Math.min(h, 0.5), 16), material(color))
      vase.position.y = Math.min(h, 0.5) / 2
      vase.castShadow = true
      group.add(vase)
      break
    }
    default: {
      group.add(box(w, h, d, color, 0, h / 2, 0))
    }
  }

  // Plan coordinates are centimetres from the room's top-left corner; the 3D
  // floor is centred on the origin, so shift by half the room to line up.
  group.position.set(item.x * M - roomW / 2, 0, item.y * M - roomL / 2)
  group.rotation.y = (-item.rotation * Math.PI) / 180
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  return group
}

export function Room3D({ room, items, badge }: Room3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    content: THREE.Group
  } | null>(null)

  const w = room.width_cm * M
  const l = room.length_cm * M

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let frame = 0
    let disposed = false

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 120)
    camera.position.set(w * 0.95, Math.max(1.9, l * 0.85), l * 1.05)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.target.set(0, 0.85, 0)
    controls.minDistance = Math.max(1.6, Math.hypot(w, l) * 0.4)
    controls.maxDistance = Math.hypot(w, l) * 3
    controls.maxPolarAngle = Math.PI / 2.05
    controls.enablePan = true
    controls.screenSpacePanning = true
    controls.update()

    const hemi = new THREE.HemisphereLight(0xfff6fb, 0xeadbc9, 2.2)
    scene.add(hemi)
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(w * 0.9, Math.max(4, l), l * 0.9)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 24
    const bound = Math.max(w, l) * 1.4
    key.shadow.camera.left = -bound
    key.shadow.camera.right = bound
    key.shadow.camera.top = bound
    key.shadow.camera.bottom = -bound
    key.shadow.bias = -0.0012
    key.shadow.camera.updateProjectionMatrix()
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffeaf2, 0.85)
    fill.position.set(-w, 2.4, -l)
    scene.add(fill)

    const content = new THREE.Group()
    scene.add(content)

    // Frame the whole room whatever the container shape: a portrait phone panel
    // needs a longer camera pull-back than a wide desktop pane.
    let userMoved = false
    controls.addEventListener('start', () => {
      userMoved = true
    })
    const fitCamera = () => {
      const dir = new THREE.Vector3(0.62, 0.78, 0.95).normalize()
      const corners: THREE.Vector3[] = []
      for (const x of [-w / 2, w / 2]) {
        for (const y of [0, 2.55]) {
          for (const z of [-l / 2, l / 2]) corners.push(new THREE.Vector3(x, y, z))
        }
      }
      // Project the room's corners and grow the distance until it fills the frame.
      let distance = Math.max(w, l) * 1.4
      for (let pass = 0; pass < 6; pass += 1) {
        camera.position.copy(controls.target).addScaledVector(dir, distance)
        camera.lookAt(controls.target)
        camera.updateMatrixWorld()
        let reach = 0
        for (const corner of corners) {
          const projected = corner.clone().project(camera)
          reach = Math.max(reach, Math.abs(projected.x), Math.abs(projected.y))
        }
        if (!Number.isFinite(reach) || reach <= 0) break
        const scale = reach / 0.9
        distance *= scale
        if (Math.abs(scale - 1) < 0.02) break
      }
      camera.position.copy(controls.target).addScaledVector(dir, distance)
      controls.minDistance = Math.min(controls.minDistance, distance * 0.45)
      controls.maxDistance = Math.max(controls.maxDistance, distance * 1.8)
      controls.update()
    }

    const resize = () => {
      const rect = mount.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      renderer.setSize(rect.width, rect.height, false)
      camera.aspect = rect.width / rect.height
      camera.updateProjectionMatrix()
      if (!userMoved) fitCamera()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    sceneRef.current = { renderer, scene, camera, controls, content }

    const loop = () => {
      if (disposed) return
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      controls.dispose()
      content.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material as THREE.Material | THREE.Material[]
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [w, l])

  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const { content, scene } = ctx
    for (const child of [...content.children]) {
      content.remove(child)
      child.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material as THREE.Material | THREE.Material[]
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
    }

    // floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, l),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(room.floor_color), roughness: 0.94 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    content.add(floor)

    // skirting / rug base shadow line
    const wallMat = material(room.wall_color, { side: THREE.DoubleSide, roughness: 0.96 })
    const wallHeight = 2.55
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, wallHeight), wallMat)
    back.position.set(0, wallHeight / 2, -l / 2)
    back.receiveShadow = true
    content.add(back)

    const left = new THREE.Mesh(new THREE.PlaneGeometry(l, wallHeight), wallMat)
    left.rotation.y = Math.PI / 2
    left.position.set(-w / 2, wallHeight / 2, 0)
    left.receiveShadow = true
    content.add(left)

    const skirting = material('#fffaf3', { roughness: 0.7 })
    const skirtBack = new THREE.Mesh(new THREE.BoxGeometry(w, 0.09, 0.03), skirting)
    skirtBack.position.set(0, 0.045, -l / 2 + 0.02)
    content.add(skirtBack)
    const skirtLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, l), skirting)
    skirtLeft.position.set(-w / 2 + 0.02, 0.045, 0)
    content.add(skirtLeft)

    // window on the back wall
    const windowLight = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(w * 0.45, 2.2), 1.15),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8f3f8') }),
    )
    windowLight.position.set(w * 0.12, 1.62, -l / 2 + 0.011)
    content.add(windowLight)
    const frameMat = material('#fffdf8', { roughness: 0.6 })
    const winW = Math.min(w * 0.45, 2.2)
    const winH = 1.15
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.08, 0.05, 0.05), frameMat)
    frameTop.position.set(w * 0.12, 1.62 + winH / 2, -l / 2 + 0.02)
    content.add(frameTop)
    const frameBottom = frameTop.clone()
    frameBottom.position.y = 1.62 - winH / 2
    content.add(frameBottom)
    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.05, winH, 0.05), frameMat)
      jamb.position.set(w * 0.12 + (side * winW) / 2, 1.62, -l / 2 + 0.02)
      content.add(jamb)
    }
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, 0.04), frameMat)
    mullion.position.set(w * 0.12, 1.62, -l / 2 + 0.02)
    content.add(mullion)

    for (const item of items) content.add(buildItem(item, w, l))
    return
  }, [items, room.floor_color, room.wall_color, w, l])

  return (
    <div className="room3d-wrap" ref={mountRef}>
      <span className="room3d-badge">{badge ?? 'Interactive 3D · drag to orbit, scroll to zoom'}</span>
    </div>
  )
}
