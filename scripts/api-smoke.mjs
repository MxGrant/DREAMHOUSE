const BASE = process.env.BASE ?? 'http://127.0.0.1:3000'
let cookie = ''
let passed = 0
let failed = 0

function check(name, condition, detail = '') {
  if (condition) {
    passed++
    console.log(`PASS  ${name}`)
  } else {
    failed++
    console.log(`FAIL  ${name} ${detail}`)
  }
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
  const setCookie = res.headers.getSetCookie?.() ?? []
  for (const c of setCookie) {
    if (c.startsWith('dh_session=')) cookie = c.split(';')[0]
  }
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = null
  }
  return { status: res.status, json, text }
}

async function main() {
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'demo@dreamhouse.studio', password: 'demo1234' },
  })
  check('login with demo account', login.status === 200 && !!cookie, JSON.stringify(login.json))

  const create = await api('/api/houses', {
    method: 'POST',
    body: { name: 'QA Test House', theme: 'mint', budget: 5000, isPublic: false },
  })
  const houseId = create.json?.houseId
  const roomId = create.json?.roomId
  check('create house + starter room', create.status === 200 && !!houseId && !!roomId)

  const roomAdd = await api(`/api/houses/${houseId}/rooms`, {
    method: 'POST',
    body: { name: 'Test Bedroom', type: 'bedroom', width: 380, length: 420 },
  })
  const room2 = roomAdd.json?.roomId
  check('add second room', roomAdd.status === 200 && !!room2)

  const patchRoom = await api(`/api/rooms/${room2}`, {
    method: 'PATCH',
    body: { name: 'Test Bedroom', width_cm: 400, wall_color: '#F4EFFF' },
  })
  check('update room dimensions and wall colour', patchRoom.status === 200)

  const addPiece = await api(`/api/rooms/${room2}/furniture`, {
    method: 'POST',
    body: { furnitureId: 'cloud-bed' },
  })
  check('add catalogue piece to room', addPiece.status === 200 && addPiece.json?.item?.name === 'Cloud Nine Upholstered Bed')

  const items = [
    addPiece.json.item,
    {
      id: 'qa-item-2',
      furnitureId: 'petite-side-table',
      name: 'Petite Round Side Table',
      category: 'table',
      x: 60,
      y: 60,
      w: 45,
      d: 45,
      h: 52,
      rotation: 0,
      color: '#F1E6D6',
      price: 190,
    },
  ]
  const saveLayout = await api(`/api/rooms/${room2}/layout`, {
    method: 'PUT',
    body: { items },
  })
  check('save room layout', saveLayout.status === 200 && saveLayout.json?.count === 2)

  const readLayout = await api(`/api/rooms/${room2}/layout`)
  check(
    'layout survives a fresh request (persistence)',
    readLayout.status === 200 && readLayout.text.includes('Petite Round Side Table'),
  )

  const saveVersion = await api(`/api/rooms/${room2}/layouts`, {
    method: 'POST',
    body: { name: 'Evening layout', items: [items[0]] },
  })
  check('save named design version', saveVersion.status === 200 && saveVersion.json?.layouts?.length === 2)

  const activate = await api(`/api/layouts/${saveVersion.json.layoutId}/activate`, { method: 'POST' })
  check('restore a saved design', activate.status === 200 && activate.json?.items?.length === 1)

  const deleteLayout = await api(`/api/layouts/${saveVersion.json.layoutId}`, { method: 'DELETE' })
  check('delete a saved design', deleteLayout.status === 200)

  const privateView = await fetch(`${BASE}/houses/${houseId}`, { headers: { cookie } })
  check('owner can view private house', privateView.status === 200)

  const publicHouses = await api('/explore')
  const sampleId = publicHouses.text.match(/\/houses\/([0-9a-f-]{36})/)?.[1]

  const like = await api(`/api/houses/${sampleId}/like`, { method: 'POST' })
  const like2 = await api(`/api/houses/${sampleId}/like`, { method: 'POST' })
  check('like toggles on and off', like.status === 200 && like.json.liked === true && like2.json.liked === false)

  const save = await api(`/api/houses/${sampleId}/save`, { method: 'POST' })
  check('save a design', save.status === 200 && save.json.saved === true)

  const comment = await api(`/api/houses/${sampleId}/comments`, {
    method: 'POST',
    body: { body: 'QA: the palette here is lovely.' },
  })
  check('post a comment', comment.status === 200 && comment.json?.comment?.body?.includes('QA:'))

  const follow = await api('/api/users/juniper/follow', { method: 'POST' })
  check('follow a designer', follow.status === 200 && typeof follow.json.following === 'boolean')

  const board = await api('/api/moodboards', {
    method: 'POST',
    body: { title: 'QA Board', description: 'testing', theme: 'peach' },
  })
  const boardId = board.json?.id
  check('create moodboard', board.status === 200 && !!boardId)

  const addColor = await api(`/api/moodboards/${boardId}/items`, {
    method: 'POST',
    body: { kind: 'color', color: '#F6C9D6', title: 'Blush' },
  })
  const addNote = await api(`/api/moodboards/${boardId}/items`, {
    method: 'POST',
    body: { kind: 'note', title: 'Rule', body: 'Warm light only.' },
  })
  const addFurniture = await api(`/api/moodboards/${boardId}/items`, {
    method: 'POST',
    body: { kind: 'furniture', refId: 'marlow-sofa', title: 'Marlow Bouclé Sofa' },
  })
  check(
    'moodboard accepts colours, notes and furniture',
    addColor.status === 200 && addNote.status === 200 && addFurniture.status === 200,
  )

  const boardPage = await api(`/moodboards/${boardId}`)
  check('moodboard page renders pieces', boardPage.status === 200 && boardPage.text.includes('Warm light only.'))

  const removeItem = await api(`/api/moodboard-items/${addColor.json.id}`, { method: 'DELETE' })
  check('remove a moodboard piece', removeItem.status === 200)

  const collection = await api('/api/collections', {
    method: 'POST',
    body: { title: 'QA Collection', description: 'test', isPublic: true },
  })
  const collectionId = collection.json?.id
  const addToCollection = await api(`/api/collections/${collectionId}/houses`, {
    method: 'POST',
    body: { houseId: sampleId, action: 'add' },
  })
  check('add a house to a collection', collection.status === 200 && addToCollection.status === 200)

  const collectionPage = await api(`/collections/${collectionId}`)
  check('collection page renders the house', collectionPage.status === 200)

  const ai = await api('/api/ai/suggest', {
    method: 'POST',
    body: { roomType: 'bedroom', style: 'japandi', budget: 4000, mood: 'calm' },
  })
  check(
    'AI stylist returns palette + furniture under budget',
    ai.status === 200 && ai.json?.plan?.palette?.length >= 4 && ai.json?.plan?.picks?.length >= 3,
  )

  const profile = await api('/api/profile', {
    method: 'PATCH',
    body: { name: 'Amelia Laurent', location: 'Copenhagen, DK', avatar_hue: 335 },
  })
  check('update profile', profile.status === 200)

  const logout = await api('/api/auth/logout', { method: 'POST' })
  const afterLogout = await api('/api/houses', { method: 'POST', body: { name: 'Nope' } })
  check('logout revokes the session', logout.status === 200 && afterLogout.status === 401)

  // login again to clean up QA artefacts
  await api('/api/auth/login', { method: 'POST', body: { email: 'demo@dreamhouse.studio', password: 'demo1234' } })
  const cleanupHouse = await api(`/api/houses/${houseId}`, { method: 'DELETE' })
  const cleanupBoard = await api(`/api/moodboards/${boardId}`, { method: 'DELETE' })
  const cleanupCollection = await api(`/api/collections/${collectionId}`, { method: 'DELETE' })
  check(
    'cleanup test house, board and collection',
    cleanupHouse.status === 200 && cleanupBoard.status === 200 && cleanupCollection.status === 200,
  )

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed ? 1 : 0)
}

main().catch((err) => {
  console.error('SMOKE ERROR', err)
  process.exit(1)
})
