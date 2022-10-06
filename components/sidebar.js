function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ navigation }) {
  return (
    <div className="hidden lg:block overflow-y-auto bg-gray-100 pb-4 w-[208px] rounded-lg">
      <div className="mt-2 flex flex-grow flex-col">
        <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-white text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              {item.icon && (
                <item.icon
                  className={classNames(
                    item.current
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                  aria-hidden="true"
                />
              )}
              <span className="flex-1">{item.name}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
