import { Link } from 'react-router-dom';
import { Hotel, Menu, X, User, LogOut, Mail, Phone, Settings, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useUser();

  // Fonction pour afficher le rôle en français
  const getRoleLabel = (role: string | undefined) => {
    if (!role) return 'Membre';

    const roleMap: Record<string, string> = {
      'client': 'Client',
      'proprietaire': 'Propriétaire',
      'admin': 'Administrateur',
    };

    return roleMap[role.toLowerCase()] || 'Membre';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Hotel className="w-6 h-6 text-white" />
              </div>
            <span className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LuxeStay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/search"
              className="text-foreground hover:text-primary transition-colors"
            >
              Rechercher
            </Link>
            <Link
              to="/search?type=hotel"
              className="text-foreground hover:text-primary transition-colors"
            >
              Hôtels
            </Link>
            <Link
              to="/search?type=house"
              className="text-foreground hover:text-primary transition-colors"
            >
              Maisons
            </Link>
            <Link
              to="/owner/register"
              className="px-4 py-2 bg-gradient-to-r from-accent to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Je suis propriétaire
            </Link>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                    {user.idPhoto ? (
                      <img
                        src={user.idPhoto}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <span className="text-white">{user.firstName}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-primary to-secondary">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="text-white">
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-white/80">{getRoleLabel(user.role)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border p-2 space-y-1">
                      {(user.role === 'proprietaire' || user.role === 'admin') && (
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Dashboard Propriétaire</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Mon Profil</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-muted rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-3">
            {user && (
              <div className="pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary to-secondary rounded-lg">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    {user.idPhoto ? (
                      <img
                        src={user.idPhoto}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-white/80">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Link 
              to="/" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/search" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Rechercher
            </Link>
            <Link 
              to="/search?type=hotel" 
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Hôtels
            </Link>
            <Link
              to="/search?type=house"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Maisons
            </Link>
            {!user?.role || user.role === 'client' ? (
              <Link
                to="/owner/register"
                className="block px-4 py-2 bg-gradient-to-r from-accent to-secondary text-white rounded-lg hover:opacity-90 transition-opacity text-center"
                onClick={() => setIsOpen(false)}
              >
                Je suis propriétaire
              </Link>
            ) : null}

            {user ? (
              <>
                {(user.role === 'proprietaire' || user.role === 'admin') && (
                  <Link
                    to="/owner/dashboard"
                    className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Dashboard Propriétaire</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Mon Profil</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-muted rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="w-full block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity text-center"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}