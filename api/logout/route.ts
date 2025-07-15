import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear the cookie on the frontend too
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
    
    response.cookies.set({
      name: 'user_email',
      value: '',
      expires: new Date(0),
      path: '/',
    })
    
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}