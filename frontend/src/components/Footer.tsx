export default function Footer() {
    return (
        <footer style={{
            position: 'fixed',
            bottom: 0,
            left: '85px',
            right: 0,
            height: '60px',
            backgroundColor: '#121212',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            borderTop: '1px solid #2a2a2a',
            zIndex: 100,
        }}>
            {/* Left: Copyright */}
            <div style={{
                fontFamily: 'Coolvetica, sans-serif',
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <span style={{ fontSize: '16px' }}>©</span>
                <span>2026 Dime. all rights reserved.</span>
            </div>

            {/* Right: Links */}
            <div style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'center',
            }}>
                <a
                    href="#privacy"
                    style={{
                        fontFamily: 'Coolvetica, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                    privacy
                </a>
                <a
                    href="#terms"
                    style={{
                        fontFamily: 'Coolvetica, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                    terms
                </a>
                <a
                    href="#support"
                    style={{
                        fontFamily: 'Coolvetica, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                    support
                </a>
            </div>
        </footer>
    )
}
