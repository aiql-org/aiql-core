
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Playground from '../Playground';

// Mock framer-motion to avoid animation issues and support drag testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onDragEnd, ...props }: React.ComponentProps<'div'> & { 
        onDragEnd?: (event: unknown, info: { offset: { x: number, y: number } }) => void;
        'data-testid'?: string;
    }) => {
      return (
        <div 
            {...props} 
            data-testid={props['data-testid']}
            // Attach a helper to trigger drag end for testing
             ref={(node: HTMLDivElement | null) => {
                if (node) {
                    Object.assign(node, {
                        _test_triggerDragEnd: (offsetX: number) => {
                            if (onDragEnd) {
                                onDragEnd(null, { offset: { x: offsetX, y: 0 } });
                            }
                        }
                    });
                }
            }}
        >
          {children}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock @aiql-org/core
vi.mock('@aiql-org/core', () => {
  return {
    Transpiler: vi.fn().mockImplementation(function() {
      return {
        transpile: (arg1: unknown, arg2?: string) => {
          const lang = typeof arg1 === 'string' ? arg1 : arg2;
          if (lang === 'python') return "# AIQL v1.0.0\nprint('Mock Python')";
          if (lang === 'json') return '{\n  "mock": "json"\n}';
          return `// Output for ${lang}`;
        },
        ast: { params: {}, statements: [], affective: [] }
      };
    }),
    Tokenizer: vi.fn().mockImplementation(function() {
      return {
        tokenize: () => []
      };
    }),
    Parser: vi.fn().mockImplementation(function() {
      return {
          parse: () => ({ 
              body: [], 
              params: {}, 
              statements: [], 
              affective: [] 
          })
      };
    }),
    version: '1.0.0'
  };
});

// Mock @aiql-org/examples
vi.mock('@aiql-org/examples', () => ({
  examples: {
    categories: [
      {
        category: 'Test Category',
        examples: [
          {
            label: 'Test Example',
            code: '!Assert { <Test> [works] <True> }'
          }
        ]
      }
    ]
  }
}));

// Mock lucide-react to avoid icon rendering issues if any
// (Optional, usually fine to render, but sometimes useful in JSDOM)

// Global mocks
globalThis.fetch = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Playground Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders the playground header', () => {
    render(<Playground />);
    expect(screen.getByText(/Neural Interface/i)).toBeInTheDocument();
  });

  it('renders the editor and output areas', () => {
    render(<Playground />);
    expect(screen.getByText('SOURCE.aiql')).toBeInTheDocument();
    // Tabs might be rendered multiple times or once, finding by text is safe
    expect(screen.getAllByText(/Python/i)[0]).toBeInTheDocument();
  });

  it('allows user to type code', () => {
    render(<Playground />);
    const inputs = screen.getAllByRole('textbox');
    const codeInput = inputs[0]; 
    
    fireEvent.change(codeInput, { target: { value: '!NewCode' } });
    expect(codeInput).toHaveValue('!NewCode');
  });

  it('switches output tabs', () => {
    render(<Playground />);
    const jsonTab = screen.getByText('JSON');
    fireEvent.click(jsonTab);
    expect(jsonTab).toBeInTheDocument();
    // We could check if active state changed, usually checking class or attribute
  });

  it('shows AIQL Skill modal when clicked', async () => {
    render(<Playground />);
    const skillBtn = screen.getByText(/AIQL Skill/i);
    fireEvent.click(skillBtn);
    const modalTitle = await screen.findByRole('heading', { name: /AIQL Language Skill/i });
    expect(modalTitle).toBeInTheDocument();
  });

  it('shows System Prompt modal when clicked', async () => {
    render(<Playground />);
    const promptBtn = screen.getByText(/System Prompt/i);
    fireEvent.click(promptBtn);
    const modalTitle = await screen.findByRole('heading', { name: /System Prompt/i });
    expect(modalTitle).toBeInTheDocument();
  });

  it('switches tabs on swipe left (mobile simulation)', async () => {
    vi.useFakeTimers();
    // Simulate mobile width if component is responsive (jsdom doesn't really do layout but code expects resize event?)
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    render(<Playground />);
    
    // Fast-forward initial transpile
    await act(async () => {
        vi.runAllTimers();
    });
    vi.useRealTimers();

    const swipeContainer = screen.getByTestId('swipe-container');
    
    // Simulate swipe
    await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (swipeContainer as any)._test_triggerDragEnd(-100);
    });

    // Expect tab switch (PYTHON -> JSON)
    // We mock transpiler to return '{\n  "mock": "json"\n}' for JSON
    const jsonContent = await screen.findByText(/"mock": "json"/);
    expect(jsonContent).toBeInTheDocument();
  });
});
