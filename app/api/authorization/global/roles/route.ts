import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAuthorizationService } from "@/lib/services/authorization"
import { GLOBAL_ROLES, type GlobalRole } from "@/lib/services/authorization-constants"

// Role hierarchy for self-assignment
const SELF_ASSIGNABLE_ROLES: GlobalRole[] = [GLOBAL_ROLES.GLOBAL_USER]
const ADMIN_REQUIRED_ROLES: GlobalRole[] = [GLOBAL_ROLES.GLOBAL_MODERATOR, GLOBAL_ROLES.GLOBAL_ADMIN]

/**
 * GET /api/authorization/global/roles
 *
 * Get the current user's global role
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const authService = getAuthorizationService()
    const globalUsers = await authService.getGlobalUsers()
    const globalPolicies = await authService.getGlobalPolicies()

    // Find current user's display role
    const currentUser = globalUsers.find((u) => u.userId === session.user.id)

    // Check if there are any global admins (for initial setup)
    const hasGlobalAdmins = globalUsers.some((u) => u.role === GLOBAL_ROLES.GLOBAL_ADMIN)

    return NextResponse.json({
      currentRole: currentUser?.role || null,
      allGlobalUsers: globalUsers,
      globalPolicies,
      hasGlobalAdmins,
      canSelfAssign: !hasGlobalAdmins, // First user can become admin
    })
  } catch (error) {
    console.error("Error fetching global roles:", error)
    return NextResponse.json({ error: "Failed to fetch global roles" }, { status: 500 })
  }
}

/**
 * PATCH /api/authorization/global/roles
 *
 * Set a user's global role
 *
 * Rules:
 * - Users can always self-assign GLOBAL_USER
 * - Users can self-assign higher roles ONLY if no global admins exist yet (initial setup)
 * - Only global admins can assign higher roles to other users
 */
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { userId, role } = body

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Validate role
  const validRoles = Object.values(GLOBAL_ROLES)
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid global role" }, { status: 400 })
  }

  const authService = getAuthorizationService()
  const globalUsers = await authService.getGlobalUsers()
  const hasGlobalAdmins = globalUsers.some((u) => u.role === GLOBAL_ROLES.GLOBAL_ADMIN)
  const requesterRole = await authService.getGlobalRole(session.user.id)

  // Check permissions
  const isSelf = userId === session.user.id
  const isRequesterAdmin = requesterRole === GLOBAL_ROLES.GLOBAL_ADMIN

  if (isSelf) {
    // Self-assignment rules
    if (SELF_ASSIGNABLE_ROLES.includes(role as GlobalRole)) {
      // Can always self-assign basic role
      // Allowed
    } else if (ADMIN_REQUIRED_ROLES.includes(role as GlobalRole)) {
      // Higher roles require admin, OR initial setup (no admins yet)
      if (hasGlobalAdmins && !isRequesterAdmin) {
        return NextResponse.json(
          { error: "Only global admins can assign this role" },
          { status: 403 }
        )
      }
    }
  } else {
    // Assigning to others - must be admin
    if (!isRequesterAdmin) {
      return NextResponse.json(
        { error: "Only global admins can change other users' roles" },
        { status: 403 }
      )
    }
  }

  try {
    await authService.assignGlobalRole(userId, role as GlobalRole)

    // Get updated info
    const newRole = await authService.getGlobalRole(userId)
    const updatedGlobalUsers = await authService.getGlobalUsers()

    return NextResponse.json({
      success: true,
      role: newRole,
      allGlobalUsers: updatedGlobalUsers,
    })
  } catch (error) {
    console.error("Error setting global role:", error)
    return NextResponse.json({ error: "Failed to set global role" }, { status: 500 })
  }
}

/**
 * DELETE /api/authorization/global/roles
 *
 * Remove a user's global role
 */
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || session.user.id

  const authService = getAuthorizationService()
  const globalUsers = await authService.getGlobalUsers()

  // Only allow users to remove their own role, or admins to remove any role
  const isSelf = userId === session.user.id
  const requesterRole = await authService.getGlobalRole(session.user.id)
  const isRequesterAdmin = requesterRole === GLOBAL_ROLES.GLOBAL_ADMIN

  if (!isSelf && !isRequesterAdmin) {
    return NextResponse.json(
      { error: "Only global admins can remove other users' roles" },
      { status: 403 }
    )
  }

  // Prevent removing the last global admin (to avoid locking out)
  if (isSelf && requesterRole === GLOBAL_ROLES.GLOBAL_ADMIN) {
    const adminCount = globalUsers.filter((u) => u.role === GLOBAL_ROLES.GLOBAL_ADMIN).length
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last global admin. Promote another admin first." },
        { status: 400 }
      )
    }
  }

  try {
    await authService.removeGlobalRole(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing global role:", error)
    return NextResponse.json({ error: "Failed to remove global role" }, { status: 500 })
  }
}
