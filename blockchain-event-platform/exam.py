def area(side):
    return side * side

def perimeter(side):
    return 4 * side

def calculate_square(side):
    a = area(side)
    p = perimeter(side)
    print(f"Side        : {side}")
    print(f"Area        : {a}")
    print(f"Perimeter   : {p}")

side = float(input("Enter the side of the square: "))
calculate_square(side)